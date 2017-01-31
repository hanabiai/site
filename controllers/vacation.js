var Vacation = require('../models/vacation.js'),
    VacationInSeasonListener = require('../models/vacationInSeasonListener.js'),
    vacationInfo = require('../lib/vacation.js');
    utility = require('../lib/utility.js');

module.exports = {
    
    detail: function(req, res, next){
        Vacation.findOne({ slug: req.params.slug }, function(err, vacation){            
            if(err) return next(err);
            if(!vacation) return next();

            var currency = req.session.currency || 'usd';
            vacation.mainImgPath = '/img/vacation/' + req.params.slug + '.jpg';
            vacation.price = utility.convertFromUSD(vacation.priceInCents, currency);
            res.render('vacation/detail', { vacation: vacation });
        });
    },
    
    home: function(req, res, next){
        vacationInfo.getVacation(5, req, res, next).then(function(vacationContext){
            switch(vacationContext.currency){
                case 'usd': vacationContext.currencyUSD = 'selected'; break;
                case 'gbp': vacationContext.currencyGBP = 'selected'; break;
                case 'btc': vacationContext.currencyBTC = 'selected'; break;
            }            
            res.render('vacation/list', vacationContext);
        });        
    },
    
    notifyInSeason: function(req, res){
        res.render('vacation/notify-in-season', { sku: req.query.sku });
    },
    
    notifyInSeasonProcessPost: function(req, res){
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
                    return res.redirect(303, '/vacation');
                }
                req.session.flash = {
                    type: 'success',
                    intro: 'Thank u!',
                    message: 'U will be notified when this vacation is in season.',
                };
                return res.redirect(303, '/vacation');
            }
        );
    },

    requestGroupRate: function(req, res){
		res.render('vacation/request-group-rate', { slug: req.params.slug });
	},
	
	requestGroupRateProcessPost: function(req, res, next){
        req.session.flash = {
            type: 'success',
            intro: 'Thank u!',
            message: 'U will be notified via email : ' + req.body.email,
        };
        var redirect = '/vacation/' + req.params.slug;
        return res.redirect(303, redirect);
	},

};