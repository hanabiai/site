module.exports = {
	
	requestGroupRate: function(req, res){
		res.render('tours/request-group-rate');
	},
	
	requestGroupRateProcessPost: function(req, res, next){
		next(new Error('Request group rate processing not yet implemented!'));
	},
	
	home: function(req, res, next){
		next(new Error('Contact page not yet implemented!'));
	},
	
	homeProcessPost: function(req, res, next){
		next(new Error('Contact page not yet implemented!'));
	},

};