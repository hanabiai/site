var fortune = require('../lib/fortune.js'),
    NewsletterSignup = require('../lib/mock-newsletter.js'),
    utility = require('../lib/utility.js');

module.exports = {

    home: function(req, res){                   
        res.render('home');
    },
    
    about: function(req, res){              
        res.render('about', { 
            fortune : fortune.getFortune(),
            pageTestScript : '/qa/tests-about.js' 
        });
    },
    
    newsletter: function(req, res){
        res.render('newsletter', {
            csrf: 'CSRF token goes here'
        });
    },
    
    newsletterProcessPost: function(req, res){
        var name = req.body.fieldName || '';
        var email = req.body.fieldEmail || '';
        //check email validation
        if(!email.match(utility.VALID_EMAIL_REGEX)){
            if(req.xhr) return res.json({error: 'Invalid email address.'});
            req.session.flash = {
                type: 'danger',
                intro: 'Validation error',
                message: 'The email address u entered is not valid',
            };
            return res.redirect(303, '/newsletter/archive');
        }
        //newsletter signup object 
        new NewsletterSignup({ name: name, email: email }).save(function(err){
            if(err) {
                if(req.xhr) return res.json({ error: 'Database error' });
                req.session.flash = {
                    type: 'danger',
                    intro: 'Database error',
                    message: 'There was a Database error: plz try again later.',
                };
                return res.redirect(303, '/newsletter/archive');
            }
            if(req.xhr) return res.json({ success: true });
            req.session.flash = {
                type: 'success',
                intro: 'Thank you',
                message: 'U have now been signed up for the newsletter',
            };
            return res.redirect(303, '/newsletter/archive');
        });
    },
    
    newsletterArchive: function(req, res){
        res.render('newsletter/archive');
    },
    
    genericThankYou: function(req, res){
        res.render('thank-you');
    },

};