module.exports = {
    checkWaivers: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) return next();
        if(cart.some(function(item){ return item.product.requireWaiver; })) {
            if(!cart.warnings) cart.warnings = [];
            cart.warnings.push('ur selected tour item requires a waiver.');
        }
        next();
    },
    checkGuestCounts: function(req, res, next){
        var cart = req.session.cart;
        if(!cart) return next();
        if(cart.some(function(item){ return item.guests > item.product.maximumGuests; })){
            if(!cart.errors) cart.errors = [];
            cart.errors.push('ur selected tour item cannot accomodate the number of guests u have selected.');
        }
        next();
    }
};