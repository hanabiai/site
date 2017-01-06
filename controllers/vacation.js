var Vacation = require('../models/vacation.js'),
    VacationInSeasonListener = require('../models/vacationInSeasonListener.js'),
    utility = require('../lib/utility.js');

// initialize vacations
require('../lib/mock-vacation.js')();

module.exports = {
    
    detail: function(req, res, next){
        Vacation.findOne({ slug: req.params.vacation }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next();
            vacation.mainImgPath = '/img/vacation/' + req.params.vacation + '.jpg';
            res.render('vacation', { vacation: vacation });
        });
    },
    
    list: function(req, res){
        Vacation.find({ available: true }, function(err, vacations){
            var currency = req.session.currency || 'USD';
            var context = {
                currency: currency,
                vacations: vacations.map(function(vacation){
                    return {
                        sku: vacation.sku,
                        name: vacation.name, 
                        description: vacation.description,
                        price: utility.convertFromUSD(vacation.priceInCents, currency),
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
    },
    
    notifyInSeason: function(req, res){
        res.render('notify-in-season', { sku: req.query.sku });
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
    },

};