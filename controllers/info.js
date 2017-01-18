var fortune = require('../lib/fortune.js');

module.exports = {

	about: function(req, res){              
        res.render('info/about', { 
            fortune : fortune.getFortune(),
            pageTestScript : '/qa/tests-about.js' 
        });
    },

	dealer: function(req, res){
        res.render('info/dealer', { googleApiKey: process.env.GOOGLE_MAP_APIKEY });
    },	
	
	home: function(req, res, next){
		next(new Error('Contact page not yet implemented!'));
	},
	
	homeProcessPost: function(req, res, next){
		next(new Error('Contact page not yet implemented!'));
	},

};