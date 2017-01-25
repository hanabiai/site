var url = require('url');

module.exports = {

    // authorization helpers
    helpers: {

        isAuthenticated: function(req, res, next){
            if(req.isAuthenticated()) return next();
            var redirect = url.parse(req.url).pathname;
            req.session.redirect = encodeURIComponent(redirect);
            res.redirect(303, '/login');
        },

        customerOnly: function(req, res, next){
            if(req.user && req.user.role === 'customer') return next();
            // customer-only pages to know they need to logon
            res.redirect(303, '/unauthentication');
        },

        employeeOnly: function(req, res, next){
            if(req.user && req.user.role === 'employee') return next();
            // employee-only authorization failures to be "hidden", 
            // to prevent potential hackers from even knowing that such a page exists
            next('route');
        },

        adminOnly: function(req, res, next){
            if(req.user && req.user.role === 'admin') return next();
            next('route');
        },

        allow: function(roles){
            return function(req, res, next){
                if(req.user && roles.split(',').indexOf(req.user.role) !== -1) return next();
                res.redirect(303, '/unauthentication');
            };
        },

    },
    
    login: function(req, res){
        var redirect = req.session.redirect;
        if(redirect) delete req.session.redirect;        
        res.render('account/login', { redirect: redirect } );
    },

    logout: function(req, res){
        //req.logout();
        req.session.destroy(function(){});        
        res.redirect(303, '/' );
    },

    // unauthorized routes
    unauthorized: function(req, res){
        res.status(403).render('account/unauthorized');
    },

    unauthentication: function(req, res){
        res.status(401).render('account/unauthentication', { 
            redirect: '/' + req.headers.referer.split('/').slice(3).join('/')
        });
    },

    // customer routes
    account: function(req, res){              
        res.render('account/account');
    },

    orderHistory: function(req, res){
        res.render('account/order-history');
    },

    emailPrefs: function(req, res){
        res.render('account/email-prefs');
    },

    // employee routes
    sales: function(req, res){
        res.render('account/sales');
    },

};
