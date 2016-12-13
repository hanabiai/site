var http = require('http'),
    express = require('express'),
    app = express(),    
    credentials = require('./credentials.js'),
    cookieParser = require('cookie-parser')(credentials.cookieSecret),
    expressSession = require('express-session'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(expressSession),
    formidable = require('formidable'),    
    fortune = require('./lib/fortune.js'),
    weatherInfo = require('./lib/mock-weather.js'),
    NewsletterSignup = require('./lib/mock-newsletter.js'),    
    cartValidation = require('./lib/cart-validation.js'),    
    emailService = require('./lib/email.js')(credentials),
    Vacation = require('./models/vacation.js'),
    VacationInSeasonListener = require('./models/vacationInSeasonListener.js'),
    handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
var dataDir = __dirname + '/data';
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// set app
app
    .engine('handlebars', handlebars.engine)
    .set('view engine', 'handlebars')
    .set('port', process.env.PORT || 3000)
    .set('view cache', false);

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

// configure database for mongoose
var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

// initialize vacations
Vacation.find(function(err, vacations){
    if(vacations.length) return;

    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' + 
            'enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of rock climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing', 'hiking', 'skiing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});

// use middleware
app
    .use(express.static(__dirname + '/public'))     //use middleware for static files path
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(cookieParser)
    .use(expressSession({
        resave: false,
        saveUninitialized: false,
        secret: credentials.cookieSecret,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }))
    .use(function(req, res, next){                  
        //set local variable for test with filtering HTTP request
        res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
        //set local variable for partial view
        if(!res.locals.partials) res.locals.partials = {};    
        res.locals.partials.weatherContext = weatherInfo.getWeatherData();
        //set local variable for flash message
        res.locals.flash = req.session.flash;
        delete req.session.flash;
        
        next();
    })
    .use(cartValidation.checkWaivers)
    .use(cartValidation.checkGuestCounts);

// check worker
app.use(function(req, res, next){
    var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
    next();
});

// HTTP Request : GET
app    
    .get('/', function(req, res){                   
        res.render('home');
    })
    .get('/about', function(req, res){              
        res.render('about', { 
            fortune : fortune.getFortune(),
            pageTestScript : '/qa/tests-about.js' 
        });
    })
    .get('/tours/request-group-rate', function(req, res){
        res.render('tours/request-group-rate');
    })
    .get('/thank-you', function(req, res){
        res.render('thank-you');
    })
    .get('/jquery-test', function(req, res){
        res.render('jquery-test');
    })
    .get('/nursery-rhyme', function(req, res){
        res.render('nursery-rhyme');
    })
    .get('/data/nursery-rhyme', function(req, res){
        res.json({
            animal: 'squirrel',
            bodyPart: 'tail',
            adjective: 'bushy',
            noun: 'heck'
        });
    })
    .get('/newsletter', function(req, res){
        res.render('newsletter', {
            csrf: 'CSRF token goes here'
        });
    })
    .get('/newsletter/archive', function(req, res){
        res.render('newsletter/archive');
    })
    .get('/contest/vacation-photo', function(req, res){
        var now = new Date();
        res.render('contest/vacation-photo', {
            year: now.getFullYear(), 
            month: now.getMonth()
        });
    })
    .get('/contest/vacation-photo/entries', function(req, res){
        res.render('contest/vacation-photo/entries');
    })
    .get('/vacation/:vacation', function(req, res, next){
        Vacation.findOne({ slug: req.params.vacation }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next();
            res.render('vacation', { vacation: vacation });
        });
    })    
    .get('/cart', function(req, res, next){
        var cart = req.session.cart;
        var currency = req.session.currency || 'USD';
        if(!cart) next();
        var context = {
            items: cart.items.map(function(item){
                item.vacation.price = convertFromUSD(item.vacation.priceInCents, currency);
                return {
                    vacation: item.vacation,
                    guests: item.guests,                                        
                };
            })
        };
        res.render('cart', { cart: context });
    })
    .get('/cart/add', function(req, res, next){
        var cart = req.session.cart || (req.session.cart = { items: [] });
        Vacation.findOne({ sku: req.query.sku }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.query.sku));
            cart.items.push({
                vacation: vacation,
                guests: req.body.guests || 1,
            });
            res.redirect(303, '/cart');
        });
    })
    .get('/cart/checkout', function(req, res, next){
        var cart = req.session.cart;
        if(!cart) next();
        res.render('cart-checkout');
    })
    .get('/vacations', function(req, res){
        Vacation.find({ available: true }, function(err, vacations){
            var currency = req.session.currency || 'USD';
            var context = {
                currency: currency,
                vacations: vacations.map(function(vacation){
                    return {
                        sku: vacation.sku,
                        name: vacation.name, 
                        description: vacation.description,
                        price: convertFromUSD(vacation.priceInCents, currency),
                        inSeason: vacation.inSeason,
                        qty: vacation.qty,
                    };
                })
            };
            switch(currency){
                case 'USD': context.currencyUSD = 'selected'; break;
                case 'GBP': context.currencyGBP = 'selected'; break;
                case 'BTC': context.currencyBTC = 'selected'; break;
            }
            res.render('vacations', context);
        });
    })
    .get('/notify-me-when-in-season', function(req, res){
        res.render('notify-me-when-in-season', { sku: req.query.sku });
    })
    .get('/set-currency/:currency', function(req, res){
        req.session.currency = req.params.currency;
        return res.redirect(303, '/vacations');
    })
    .get('/epic-fail', function(req, res){
        process.nextTick(function(){
            throw new Error('kaboom!');
        });
    });

// HTTP Request : POST
app
    .post('/process', function(req, res){
        if(req.xhr || req.accepts('json,html') === 'json'){
            res.send({ success: true });
        } else {
            res.redirect(303, '/thank-you');
        }        
    })
    .post('/contest/vacation-photo/:year/:month', function(req, res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files){
            if(err) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing ur submission. Plz try again.',
                };
                return res.redirect(303, '/contest/vacation-photo');
            }

            var photo = files.fieldPhoto;
            var vacationPhotoDir = dataDir + '/vacation-photo';
            var dir = vacationPhotoDir + '/' + fields.fieldName;
            var path = dir + '/' + photo.name;
            if(!fs.existsSync(vacationPhotoDir)) fs.mkdirSync(vacationPhotoDir);
            if(!fs.existsSync(dir)) fs.mkdirSync(dir);
            fs.renameSync(photo.path, path);
            saveContestEntry('vacation-photo', fields.fieldEmail, req.params.year, req.params.month, path);
            req.session.flash = {
                type: 'success',
                intro: 'Good luck!',
                message: 'U have been entered into the contest.',
            };
            return res.redirect(303, '/contest/vacation-photo/entries');
        });
    })
    .post('/newsletter', function(req, res){
        var name = req.body.fieldName || '';
        var email = req.body.fieldEmail || '';
        //check email validation
        if(!email.match(VALID_EMAIL_REGEX)){
            if(req.xhr) return res.json({error: 'Invalid email address.'});
            req.session.flash = {
                type: 'danger',
                intro: 'Validation error',
                message: 'The email address u entered is not valid',
            };
            return res.redirect(303, '/newsletter/archive');
        }
        //newsletter signup object 
        new NewsletterSignup({ name: name, email: email }).save(function(err){
            if(err) {
                if(req.xhr) return res.json({ error: 'Database error' });
                req.session.flash = {
                    type: 'danger',
                    intro: 'Database error',
                    message: 'There was a Database error: plz try again later.',
                };
                return res.redirect(303, '/newsletter/archive');
            }
            if(req.xhr) return res.json({ success: true });
            req.session.flash = {
                type: 'success',
                intro: 'Thank you',
                message: 'U have now been signed up for the newsletter',
            };
            return res.redirect(303, '/newsletter/archive');
        });
    })
    .post('/cart/add', function(req, res, next){
        var cart = req.session.cart || (req.session.cart = { items: [] });
        Vacation.findOne({ sku: req.body.sku }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.body.sku));
            cart.items.push({
                vacation: vacation,
                guests: req.body.guests || 0,
            });
            res.redirect(303, '/cart');
        });
    })
    .post('/cart/checkout', function(req, res){
        var cart = req.session.cart;
        if(!cart) next(new Error('Cart does not exist.'));
        var name = req.body.fieldName || '';
        var email = req.body.fieldEmail || '';
        //check email validation
        if(!email.match(VALID_EMAIL_REGEX)) return res.next(new Error('Invalid email address'));
        //set random cart ID
        cart.number = Math.random().toString().replace(/^0\.0*/, '');
        cart.billing = {
            name: name,
            email: email,
        };
        res.render('email/cart-thank-you', { layout: null, cart: cart }, function(err, html){
            if(err) console.log('error in email template.');
            emailService.send(cart.billing.email, 'Thank you for booking your trip with Meadowlark Travel!', html);
        });
        res.render('cart-thank-you', { cart: cart });
    })
    .post('/notify-me-when-in-season', function(req, res){
        VacationInSeasonListener.update(
            { email: req.body.fieldEmail },
            { $push: { skus: req.body.sku } },
            { upsert: true },
            function(err){
                if(err){
                    console.error(err.stack);
                    req.session.flash = {
                        type: 'danger',
                        intro: 'Oops!',
                        message: 'There was an error processing ur request',
                    };
                    return res.redirect(303, '/vacations');
                }
                req.session.flash = {
                    type: 'success',
                    intro: 'Thank u!',
                    message: 'U will be notified when this vacation is in season.',
                };
                return res.redirect(303, '/vacations');
            }
        );
    });

// use middleware for 404, 500 error page
app
    .use(function(req, res, next){    
        res.status(404).render('404');
    })
    .use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500).render('500');
    });

//
function convertFromUSD(value, currency){
    switch(currency){
    	case 'USD': return 'USD: ' + (value / 100 * 1).toFixed(2);
        case 'GBP': return 'GBP: ' + (value / 100 * 0.6).toFixed(2);
        case 'BTC': return 'BTC: ' + (value / 100 * 0.0023707918444761).toFixed(2);
        default: return NaN;
    }
}

//
function saveContestEntry(contestName, email, year, month, photoPath){
    // TODO...this will come later
}

// create server instance
var server;
function startServer(){
    server = http.createServer(app).listen(app.get('port'), function(){
        console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port') + ';\n' +
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

if(app.thing === null) console.log('bleat!');