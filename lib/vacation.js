var Vacation = require('../models/vacation.js'),
    utility = require('../lib/utility.js');

module.exports = {
    
    getVacation : function(cnt, req, res){        
        return new Promise(function(resolve, reject){
            Vacation.find({ available: true }).sort({ _id: -1 }).limit(cnt).exec(function(err, vacations){
                if(err) return reject(err);

                var currency = req.session.currency || 'usd';
                var context = {
                    currency : currency,
                    vacations : vacations.map(function(vacation){
                        return {
                            sku: vacation.sku,
                            name: vacation.name,
                            slug: vacation.slug, 
                            description: vacation.description,
                            price: utility.convertFromUSD(vacation.priceInCents, currency),
                            inSeason: vacation.inSeason,
                            qty: vacation.qty,
                            imgPath: '/img/vacation/' + vacation.slug + '.jpg',
                        };
                    }),
                };                    
                resolve(context);
            });
        });        
    },
    
};