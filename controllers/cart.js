var Vacation = require('../models/vacation.js'),
    emailService = require('../lib/email.js')(),
    utility = require('../lib/utility.js');

function addToCart(sku, guests, req, res, next){    
	var cart = req.session.cart || (req.session.cart = { items: [] });
    Vacation.findOne({ sku: sku }, function(err, vacation){
        if(err) return next(err);
        if(!vacation) return next(new Error('Unknown vacation SKU: ' + sku));
        cart.items.push({
            vacation: vacation,
            guests: guests || 1,
        });        
        res.redirect(303, '/cart');
    });
}

module.exports = {
    // deserializes cart items from the database
    middleware: function(req, res, next){
        var cart = req.session.cart;
        if(!cart || !cart.items) return next();
        var currency = req.session.currency || 'usd';
        req.cart = {
            items: cart.items.map(function(item){                
                item.price = utility.convertFromUSD(item.vacation.priceInCents, currency);
                item.totalPrice = utility.convertFromUSD(item.vacation.priceInCents * item.guests, currency);
                return {
                    vacation: item.vacation,
                    guests: item.guests,
                    price: item.price,
                    totalPrice: item.totalPrice,
                };
            }),
            sum: cart.items.reduce(function(ac, cv, ci, ar){                
                return (cart.items.length > 0) ? 
                    utility.convertFromUSD(ac + cv.vacation.priceInCents * cv.guests, currency) : 0;
            }, 0),
        };
        var promises = req.cart.items.map(function(item){
            return new Promise(function(resolve, reject){
                Vacation.findOne({ sku: item.vacation.sku }, function(err, vacation){
                    if(err) return reject(err);
                    item.vacation = vacation;
                    resolve();
                });
            });
        });
        Promise.all(promises)
            .then(function(){                
                next();
            })
            .catch(function(err){
                next(err);	
            });
    },
    
    home: function(req, res, next){
        var currency = req.session.currency || 'usd';                       
        res.render('cart/list', { cart: req.cart, currency: currency });
    },
    
    addProcessGet: function(req, res, next){
        // HTTP GET Request - req.query
        addToCart(req.query.sku, req.query.guests, req, res, next);
    },
    
    addProcessPost: function(req, res, next){
        // HTTP POST request - req.body
        addToCart(req.body.sku, req.body.guests, req, res, next);
    },
    
    checkout: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) next();
        res.render('cart/cart-checkout');
    },
    
    checkoutProcessPost: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) next(new Error('Cart does not exist.'));
        var name = req.body.fieldName || '';
        var email = req.body.fieldEmail || '';
        //check email validation
        if(!email.match(utility.VALID_EMAIL_REGEX)) return next(new Error('Invalid email address.')); 
        //set random cart ID
        cart.number = Math.random().toString().replace(/^0\.0*/, '');
        cart.billing = {
            name: name,
            email: email,
        };
        res.render('cart/email-thank-you', { layout: null, cart: cart }, function(err, html){
            if(err) console.log('error in email template.');
            emailService.send(cart.billing.email, 'Thank you for booking your trip with Meadowlark Travel!', html);
        });
        
        delete req.session.cart; 
        res.render('cart/cart-thank-you', { cart: cart, flash: {
            type: 'success',
            intro: 'Thank u!',
            message: 'U will be notified of booking info via email.',
        }});
    },
    
    thankYou: function(req, res){
        res.render('cart/cart-thank-you', { cart: req.session.cart });
    },
    
    emailThankYou: function(req, res){
        res.render('cart/email-thank-you', { cart: req.session.cart, layout: null });
    },
    
    setCurrency: function(req, res){
        req.session.currency = req.params.currency;
        return res.redirect(303, '/vacation');
    },

};