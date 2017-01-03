/* ==========================================================================

   ========================================================================== */

var http = require('http'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    vhost = require('vhost'),
    Q = require('q'),   
    handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            static: function(name){
                return require('./lib/static.js').map(name);
            }
        }
    });

// set app
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 5000);
//app.set('view cache', false);


   
// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN Error caught\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(e) {
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', e.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(e){
            console.error('Unable to send 500 response.\n', e.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

// configure for logging
switch(app.get('env')){
    case 'development':
        //app.use(require('morgan')('dev'));
        break;
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

// check worker
app.use(function(req, res, next){
    var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
    next();
});




var expressSession = require('express-session'),    
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(expressSession),             
    static = require('./lib/static.js').map,
    weatherInfo = require('./lib/weather.js')(),
    twitter = require('./lib/twitter.js')({
        consumerKey: process.env.TWITTER_API_CONSUMERKEY,
        consumerSecret: process.env.TWITTER_API_CONSUMERSECRET,
    }),    
    geocode = require('./lib/geocode.js')();


// configure database for mongoose
var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};

mongoose.Promise = global.Promise;
switch(app.get('env')){
    case 'development':        
        mongoose.connect(process.env.MONGOLAB_CONNSTRING, opts);
        break;
    case 'production':        
        mongoose.connect(process.env.MONGOLAB_CONNSTRING, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

// use middleware
app
    .use(express.static(__dirname + '/public'))     //use middleware for static files path
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(require('cookie-parser')(process.env.COOKIE_SECRET))
    .use(expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }))
    .use(require('csurf')());

// set CSRF token
app.use(function(req, res, next){
    res.locals._csrfToken = req.csrfToken();
    next();
});

// middleware to set 'showTests' context property if the querystring contains test=1
app.use(function(req, res, next){                          
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});
// middleware to set flash message
app.use(function(req, res, next){
    res.locals.flash = req.session.flash;
    delete req.session.flash;        
    next();
});
// middleware to handle logo image easter eggs
app.use(function(req, res, next){
    var now = new Date();
    res.locals.logoImage = (now.getMonth() == 11 && now.getDate() == 19) ? 
        static('/img/logo_bud_clark.png') : static('/img/logo.png');
    next();
});
// middleware to provide cart data for header
app.use(function(req, res, next) {
    var cart = req.session.cart;
    res.locals.cartItems = cart && cart.items ? cart.items.length : 0;
    next();
});
// middleware to add weather data to context
app.use(function(req, res, next){        
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = weatherInfo.getWeatherData();
    next();
});
// mmiddleware to add top tweets to context
app.use(function(req, res, next) {
	res.locals.topTweets = twitter.getTopTweets();
    next();
});
// middleware to set google geocode
app.use(function(req, res, next){
    geocode.refresh(function(refreshInterval){
        // call self after refresh interval
        setTimeout(geocode.refresh, refreshInterval);
    });
    next();
});


// create "admin" subdomain...
// this should appear before all other routes
var admin = express.Router();
app.use(vhost('admin.*', admin));

// create admin routes; 
admin.get('/', function(req, res){
	res.render('admin/home');
});


// authentication
var auth = require('./lib/auth.js')(app, {
    baseUrl: process.env.BASE_URL,    
    successRedirect: '/account',
    failureRedirect: '/unauthorized',
});
// auth.init() links in Passport middleware:
auth.init();

// specify our auth routes:
auth.registerRoutes();








// add routes
require('./routes.js')(app);



// API configuration
var apiOptions = {
    context: '',
    //domain: require('domain').create(),
};

// api
var Attraction = require('./models/attraction.js');
var rest = require('connect-rest').create(apiOptions);
var cors = require('cors');



// link API into pipeline
app.use(vhost('api.*', rest.processRequest()));

rest.get('/attractions', cors(), function(req, content, cb){
    Attraction.find({ approved: true }, function(err, attractions){
        if(err) return cb({error: 'internal error'});
        cb(null, attractions.map(function(doc){
            return {
                name: doc.name,
                id: doc._id,
                description: doc.description,
                location: doc.location,
            };
        }));
    });
});

rest.get('/attraction/:id', cors(), function(req, content, cb){
    Attraction.findById(req.params.id, function(err, doc){
        if(err) return cb({error: 'Unable to retrieve attraction'});
        cb(null, {
            name: doc.name,
            id: doc._id,
            description: doc.description,
            location: doc.location,
        });
    });
});

rest.post('/attraction', cors(), function(req, content, cb){    
    var attraction = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    attraction.save(function(err, doc){
        if(err) return cb('error: Unabe to add attraction.');
        cb(null, { id: doc._id });
    });
});






// // currently commented to skip employee's next('route') to 404 handler 
// // add support for auto views
// var autoViews = {};
// app.use(function(req,res,next){
//     var path = req.path.toLowerCase();  
//     // check cache; if it's there, render the view
//     if(autoViews[path]) return res.render(autoViews[path]);
//     // if it's not in the cache, see if there's a .handlebars file that matches
//     if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
//         autoViews[path] = path.replace(/^\//, '');
//         return res.render(autoViews[path]);
//     }
//     // no view found; pass on to 404 handler
//     next();
// });

// use middleware for 404, 500 error page
app.use(function(req, res, next){    
    res.status(404).render('404');
});
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).render('500');
});



// create server instance
var server;

function startServer(){    	
	
    server = http.createServer(app).listen(app.get('port'), function(){
        console.log('Express started in ' + app.get('env') + ' mode on port:' + app.get('port') + ' using HTTP.\n' +
            'press ctrl-C to quit');
    });

}

// if require.main is module, application run directly after starting app server
// else application imported as a module via "require": export function to create server
if(require.main === module){    
    startServer();
} else {    
    module.exports = startServer;
}
