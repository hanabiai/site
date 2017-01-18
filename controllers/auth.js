
module.exports = {

    // authorization helpers
    helpers: {

        isAuthenticated: function(req, res, next){
            if(req.isAuthenticated()) return next();
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
        res.render('account/login' );
    },

    logout: function(req, res){
        req.session.destroy(function(){
            //req.logout();
        });
        process.nextTick(function () {                
            console.log(req.user);
        });        
        res.redirect(303, '/' );
    },

    // unauthorized routes
    unauthorized: function(req, res){
        res.status(403).render('account/unauthorized');
    },

    unauthentication: function(req, res){
        res.status(403).render('account/unauthentication', { 
            redirect: '/' + req.headers.referer.split('/').slice(3).join('/')
        });
    },

    // customer routes
    account: function(req, res){              
        res.render('account/account', { user: req.user });
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
