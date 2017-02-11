var async = require('async'),
    mongoose = require('../lib/connect-db.js')(),
    Dealer = require('../models/dealer.js'),
    Order = require('../models/order.js'),
    Vacation = require('../models/vacation.js');

var data = {
    dealers: [
        {
            name: 'Oregon Novelties',
            address1: '912 NW Davis St',
            city: 'Portland',
            state: 'OR',
            zip: '97209',
            country: 'US',
            phone: '503-555-1212',
            active: true,
        },
        {
            name: 'Bruce\'s Bric-a-Brac',
            address1: '159 Beeswax Ln',
            city: 'Manzanita',
            state: 'OR',
            zip: '97209',
            country: 'US',
            phone: '503-555-1212',
            active: true,
        },
        {
            name: 'Aunt Beru\'s Oregon Souveniers',
            address1: '544 NE Emerson Ave',
            city: 'Bend',
            state: 'OR',
            zip: '97701',
            country: 'US',
            phone: '503-555-1212',
            active: true,
        },
        {
            name: 'Oregon Goodies',
            address1: '1353 NW Beca Ave',
            city: 'Corvallis',
            state: 'OR',
            zip: '97330',
            country: 'US',
            phone: '503-555-1212',
            active: true,
        },
        {
            name: 'Oregon Grab-n-Fly',
            address1: '7000 NE Airport Way',
            city: 'Portland',
            state: 'OR',
            zip: '97219',
            country: 'US',
            phone: '503-555-1212',
            active: true,
        },
    ],
    orders: [
        {            
            customerId: '5857ab1356adb11edcd5b332',
            date: new Date(),
            status: 'delivering',
        },
        {            
            customerId: '5857ab1356adb11edcd5b332',
            date: new Date(),
            status: 'packaging',
        },
    ],
    vacations: [
        {
            name: 'Hood River Day Trip',
            slug: 'hood-river-day-trip',
            category: 'Day Trip',
            sku: 'HR199',
            description: 'Spend a day sailing on the Columbia and ' + 
                'enjoying craft beers in Hood River!',
            priceInCents: 9995,
            tags: ['hood river', 'day trip', 'sailing', 'windsurfing', 'breweries'],
            inSeason: true,
            maximumGuests: 16,
            available: true,
            packagesSold: 0,
        },
        {
            name: 'Oregon Coast Getaway',
            slug: 'oregon-coast-getaway',
            category: 'Weekend Getaway',
            sku: 'OC39',
            description: 'Enjoy the ocean air and quaint coastal towns!',
            priceInCents: 269995,
            tags: ['oregon coast', 'weekend getaway', 'beachcombing'],
            inSeason: false,
            maximumGuests: 8,
            available: true,
            packagesSold: 0,
        },
        {
            name: 'Rock Climbing in Bend',
            slug: 'rock-climbing-in-bend',
            category: 'Adventure',
            sku: 'B99',
            description: 'Experience the thrill of rock climbing in the high desert.',
            priceInCents: 289995,
            tags: ['bend', 'weekend getaway', 'high desert', 'rock climbing', 'hiking', 'skiing'],
            inSeason: true,
            requiresWaiver: true,
            maximumGuests: 4,
            available: false,
            packagesSold: 0,
            notes: 'The tour guide is currently recovering from a skiing accident.',
        },
    ],
};

var addVacation = function(cb){
    console.info('Adding vacation data...');
    Vacation.find({}, function(err, vacations){
        if(vacations.length) { 
            console.info('vacation data exists.');            
            return cb(null, []);
        }
        Vacation.create(data.vacations, function(err, res){
            if(err) return console.error(err);
            console.info('vacation data added.');
            cb(null, res);
        });
    });
};

var addOrder = function(cb){
    console.info('Adding order data...');
    Order.find({}, function(err, orders){
        if(orders.length) { 
            console.info('order data exists.');            
            return cb(null, []);
        }
        Order.create(data.orders, function(err, res){
            if(err) return console.error(err);
            console.info('order data added.');
            cb(null, res);
        });
    });
};

var addDealer = function(cb){
    console.info('Adding dealer data...');
    Dealer.find({}, function(err, dealers){
        if(dealers.length) { 
            console.info('dealer data exists.');            
            return cb(null, []);
        }
        Dealer.create(data.dealers, function(err, res){
            if(err) return console.error(err);
            console.info('dealer data added.');
            cb(null, res);
        });
    });    
};

async.series([
    addVacation,
    addOrder,
    addDealer,
], function(err, results){
    if(err) console.error(err);
    mongoose.connection.close();
    console.log('Done!');
});
