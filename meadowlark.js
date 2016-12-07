var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');
var weatherInfo = require('./lib/weather.js');
var credentials = require('./credentials.js');
var cartValidation = require('./lib/cart-validation.js');
var formidable = require('formidable');
var nodemailer = require('nodemailer');
var handlebars = require('express-handlebars').create({
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
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Naver',
    auth: {
        user: credentials.naver.user,
        pass: credentials.naver.password,
    }
});

//set app
app
    .engine('handlebars', handlebars.engine)
    .set('view engine', 'handlebars')
    .set('port', process.env.PORT || 3000)
    .set('view cache', false);

//use middleware
app
    .use(express.static(__dirname + '/public'))     //use middleware for static files path
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(require('cookie-parser')(credentials.cookieSecret))
    .use(require('express-session')({
        resave: false,
        saveUninitialized: false,
        secret: credentials.cookieSecret
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
    });

//HTTP Request : GET
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
    .get('/tours/hood-river', function(req, res){   
        res.render('tours/hood-river');
    })
    .get('/tours/oregon-coast', function(req, res){ 
        res.render('tours/oregon-coast');
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
    });

//HTTP Request : POST
// for now, mocking newsletter signup object:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};

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
            if(err) return res.redirect(303, '/error');
            console.log('received fields:');
            console.log(fields);
            console.log('received files');
            console.log(files);
            res.redirect(303, '/thank-you');
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
    });

//use middleware for 404, 500 error page
app
    .use(cartValidation.checkWaivers)
    .use(cartValidation.checkGuestCounts)
    .use(function(req, res, next){    
        res.status(404).render('404');
    })
    .use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500).render('500');
    });

//app start
app.listen(app.get('port'), function(){
    console.log('Express started on localhost:' + app.get('port'));
});

if(app.thing === null) console.log('bleat!');