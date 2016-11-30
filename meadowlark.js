var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');

//set handlebars view engine
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//use middleware for test
app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

//home page
app.get('/', function(req, res){
    res.render('home');
});

//about page
app.get('/about', function(req, res){
    res.render('about', { 
        fortune : fortune.getFortune(),
        pageTestScript : '/qa/tests-about.js' 
    });
});

//hood-river page
app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river');
});

//oregon-coast page
app.get('/tours/oregon-coast', function(req, res){
    res.render('tours/oregon-coast');
});

//request group rate page
app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

//use middleware for static files
app.use(express.static(__dirname + '/public'));

//custom 404 page
app.use(function(req, res, next){    
    res.status(404);
    res.render('404');
});

//custom 500 page
app.use(function(req, res, err, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on localhost:' + app.get('port'));
});

if(app.thing === null) console.log('bleat!');