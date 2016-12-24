
module.exports = {

    // authorization helpers
    helpers: {

        customerOnly: function(req, res, next){
            if(req.user && req.user.role === 'customer') return next();
            // customer-only pages to know they need to logon
            res.redirect(303, '/unauthorized');
        },

        employeeOnly: function(req, res, next){
            if(req.user && req.user.role === 'employee') return next();
            // employee-only authorization failures to be "hidden", 
            // to prevent potential hackers from even knowing that such a page exists
            next('route');
        },

        allow: function(roles){
            return function(req, res, next){
                if(req.user && roles.split(',').indexOf(req.user.role) !== -1) return next();
                res.redirect(303, '/unauthorized');
            };
        },

    },

    // unauthorized routes
    unauthorized: function(req, res){
        res.status(403).render('unauthorized');
    },

    // customer routes
    account: function(req, res){
        res.render('account', { username: req.user.name });
    },

    orderHistory: function(req, res){
        res.render('account/order-history');
    },

    emailPrefs: function(req, res){
        res.render('account/email-prefs');
    },

    // employee routes
    sales: function(req, res){
        res.render('sales');
    },

};
