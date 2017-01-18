var Order = require('../models/order.js');

module.exports = function(){
    Order.find(function(err, orders){
        if(orders.length) return;

        new Order({            
            customerId: '5857ab1356adb11edcd5b332',
            date: new Date(),
            status: 'delivering',
        }).save();

        new Order({            
            customerId: '5857ab1356adb11edcd5b332',
            date: new Date(),
            status: 'packaging',
        }).save();
        
    });    
};
