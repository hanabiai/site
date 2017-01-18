var Vacation = require('../models/vacation.js');

// initialize vacations
require('../models/mock-vacation.js')();

module.exports = function(){

    var c = {
        vacations: []
    };

    (function(){
        Vacation.find({ available: true }).sort({ _id: -1}).limit(3).exec(function(err, vacations){            
            c.vacations = vacations.map(function(vacation){
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    slug: vacation.slug, 
                    description: vacation.description,
                    priceInCents: vacation.priceInCents,
                    inSeason: vacation.inSeason,
                    qty: vacation.qty,
                };
            });
        });
    })();

    return {
        getTopVacation: function(){
            return c.vacations;
        },
    };
};