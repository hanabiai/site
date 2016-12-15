var Vacation = require('../models/vacation.js'),
    emailService = require('../lib/email.js')(require('../credentials.js')),
    utility = require('../lib/utility.js');

module.exports = {
    // deserializes cart items from the database
    middleware: function(req, res, next){
        var cart = req.session.cart;
        var currency = req.session.currency || 'USD';
        if(!cart || !cart.items) return next();
        req.cart = {
            items: cart.items.map(function(item){
                item.vacation.price = utility.convertFromUSD(item.vacation.priceInCents, currency);
                return {
                    vacation: item.vacation,
                    guests: item.guests,                                        
                };
            })
        };
        next();
    },
    
    home: function(req, res, next){
        res.render('cart', { cart: req.cart });
    },
    
    addProcessGet: function(req, res, next){
        var cart = req.session.cart || (req.session.cart = { items: [] });
        Vacation.findOne({ sku: req.query.sku }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.query.sku));
            cart.items.push({
                vacation: vacation,
                guests: req.body.guests || 1,
            });
            res.redirect(303, '/cart');
        });
    },
    
    addProcessPost: function(req, res, next){
        var cart = req.session.cart || (req.session.cart = { items: [] });
        Vacation.findOne({ sku: req.body.sku }, function(err, vacation){
            if(err) return next(err);
            if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.body.sku));
            cart.items.push({
                vacation: vacation,
                guests: req.body.guests || 0,
            });
            res.redirect(303, '/cart');
        });
    },
    
    checkout: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) next();
        res.render('cart-checkout');
    },
    
    checkoutProcessPost: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) next(new Error('Cart does not exist.'));
        var name = req.body.fieldName || '';
        var email = req.body.fieldEmail || '';
        //check email validation
        if(!email.match(utility.VALID_EMAIL_REGEX)) return res.next(new Error('Invalid email address.')); 
        //set random cart ID
        cart.number = Math.random().toString().replace(/^0\.0*/, '');
        cart.billing = {
            name: name,
            email: email,
        };
        res.render('email/cart-thank-you', { layout: null, cart: cart }, function(err, html){
            if(err) console.log('error in email template.');
            emailService.send(cart.billing.email, 'Thank you for booking your trip with Meadowlark Travel!', html);
        });
        res.render('cart-thank-you', { cart: cart });
    },
    
    thankYou: function(req, res){
        res.render('cart-thank-you', { cart: req.session.cart });
    },
    
    emailThankYou: function(req, res){
        res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
    },
    
    setCurrency: function(req, res){
        req.session.currency = req.params.currency;
        return res.redirect(303, '/vacations');
    },

};