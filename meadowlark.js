var express = require('express');
var app = express();
var fortunes = [
    "a", "b", "c", "d", "e"
];

//set handlebars view engine
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//home page
app.get('/', function(req, res){
    res.render('home');
});

//about page
app.get('/about', function(req, res){
    var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', { fortune : randomFortune });
});

//use static middleware
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
})