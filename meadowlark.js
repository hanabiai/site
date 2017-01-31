/* ==========================================================================
    app's environment configuration
   ========================================================================== */
var http = require('http'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        extname: '.hbs',
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            static: function(name){
                return require('./lib/static.js').map(name);
            },
        },
        partialsDir: [
            'views/partials/',
        ],
    });

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 5000);

// configure database for mongoose
var session = require('express-session'),    
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session);

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

var static = require('./lib/static.js').map,
    weatherInfo = require('./lib/weather.js')(),    
    twitter = require('./lib/twitter.js')({
        consumerKey: process.env.TWITTER_API_CONSUMERKEY,
        consumerSecret: process.env.TWITTER_API_CONSUMERSECRET,
    }),    
    geocode = require('./lib/geocode.js')();

/* ==========================================================================
    app's middleware configuration
   ========================================================================== */
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
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
    default: 
        //app.use(require('morgan')('dev'));
        break;
}

// check worker
app.use(function(req, res, next){
    var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
    next();
});

app.use(express.static(path.join(__dirname,'public'), { maxAge: 31536000000 }))
    .use(require('cookie-parser')(process.env.COOKIE_SECRET))
    .use(require('body-parser').urlencoded({ extended: true }))    
    .use(session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }))
    .use(require('csurf')())
    // middleware to set '_csrfToken' context property
    .use(function(req, res, next){
        res.locals._csrfToken = req.csrfToken();
        next();
    })
    // middleware to set 'showTests' context property if the querystring contains test=1
    .use(function(req, res, next){                          
        res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
        next();
    })
    // middleware to set flash message
    .use(function(req, res, next){
        res.locals.flash = req.session.flash;
        delete req.session.flash;        
        next();
    })
    // middleware to handle logo image easter eggs
    .use(function(req, res, next){
        var now = new Date();
        res.locals.logoImage = (now.getMonth() == 11 && now.getDate() == 19) ? 
            static('/img/logo_bud_clark.png') : static('/img/logo.png');
        next();
    })
    // middleware to provide cart data for header
    .use(function(req, res, next) {        
        var cart = req.session.cart;
        res.locals.cartItems = cart && cart.items ? cart.items.length : 0;
        next();
    })
    // middleware to add weather data to context
    .use(function(req, res, next){        
        if(!res.locals.partials) res.locals.partials = {};
        res.locals.partials.weatherContext = weatherInfo.getWeatherData();        
        next();
    })
    // mmiddleware to add top tweets to context
    .use(function(req, res, next) {
        res.locals.topTweets = twitter.getTopTweets();
        next();
    })
    // middleware to set google geocode
    .use(function(req, res, next){
        geocode.refresh(function(refreshInterval){
            // call self after refresh interval
            setTimeout(geocode.refresh, refreshInterval);
        });
        next();
    });

/* ==========================================================================
    app's routes configuration
   ========================================================================== */
// authentication
var auth = require('./lib/auth.js')(app, {
    baseUrl: process.env.BASE_URL,    
    successRedirect: '/account',
    failureRedirect: '/unauthorized',
});
// auth.init() links in Passport middleware:
auth.init();

// specify auth routes:
auth.registerRoutes();

// create "admin" subdomain...
// this should appear before all other routes
var vhost = require('vhost'),
    adminRouter = express.Router(),
    apiRouter = express.Router();

app.use(vhost('admin.*', adminRouter))
    .use(vhost('api.*', apiRouter));

// add routes for admin
require('./routes/admin.js')(adminRouter);

// add routes for api
require('./routes/api.js')(apiRouter);

// add routes for end-user
require('./routes/user.js')(app);


// use middleware for 404, 500 error page
app.use(function(req, res, next){    
        res.status(404).render('404', { flash: {
            type: 'danger',
            intro: 'Oops!',
            message: 'Page not exist. plz check url.',
        }});
    })
    .use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500).render('500', { flash: {
            type: 'danger',
            intro: 'Oops!',
            message: 'Internal error invoked. plz try later.',
        }});
    });

/* ==========================================================================
    app loading
   ========================================================================== */
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
