var User = require('../models/user.js'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){    
    User.findById(id, function(err, user){
        if(err || !user) return done(err, null);
        console.log("user deserialized: "+ user._id);
        done(null, user);
    });
});

module.exports = function(app, options){

    // if success and failure redirects aren't specified,
	// set some reasonable defaults
    if(!options.successRedirect){
        options.successRedirect = '/account';
    }
    if(!options.failureRedirect){
        options.failureRedirect = '/login';
    }

    return {

        init: function(){
            var env = app.get('env');

            // configure Facebook strategy
            passport.use(new FacebookStrategy({
                clientID: process.env.FACEBOOK_OAUTH_APPID,
                clientSecret: process.env.FACEBOOK_OAUTH_APPSECRET,
                callbackURL: (options.baseUrl || '') + '/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'email']
            }, function(accessToken, refreshToken, profile, done){                 
                var authId = 'facebook_' + profile.id;
                User.findOne({ authId: authId }, function(err, user){
                    if(err) return done(err, null);
                    if(user) return done(null, user);
                    user = new User({
                        authId: authId,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        provider: profile.provider,
                        created: Date.now(),
                        role: 'customer',
                    });
                    user.save(function(err){
                        if(err) return done(err, null);
                        done(null, user);
                    });
                });

                process.nextTick(function () {                
                    console.log(profile);
                });
            }));
            
            // configure Google strategy
            passport.use(new GoogleStrategy({
                clientID: process.env.GOOGLE_OAUTH_CLIENTID,
                clientSecret: process.env.GOOGLE_OAUTH_CLIENTSECRET,
                callbackURL: (options.baseUrl || '') + '/auth/google/callback',                
                profileFields: ['id', 'displayName', 'email']
            }, function(accessToken, refreshToken, profile, done){
                var authId = 'google_' + profile.id;
                User.findOne({ authId: authId }, function(err, user){
                    if(err) return done(err, null);
                    if(user) return done(null, user);
                    user = new User({
                        authId: authId,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        created: Date.now(),
                        role: 'customer',
                    });
                    user.save(function(err){
                        if(err) return done(err, null);
                        done(null, user);
                    });
                }); 
            }));

            app.use(passport.initialize());
            app.use(passport.session()); 
        },

        registerRoutes: function() {
            app.get('/auth/facebook', function(req, res, next){
                if(req.query.redirect) req.session.authRedirect = req.query.redirect;
                passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
            });

            app.get('/auth/facebook/callback', passport.authenticate('facebook', {
                failureRedirect: options.failureRedirect,
            }), function(req, res){
                // only get here on successful authentication
                //req.session.user = req.user;  

                var redirect = req.session.authRedirect;
                if(redirect) delete req.session.authRedirect;                
                res.redirect(303, redirect || options.successRedirect);
            });

            app.get('/auth/google', function(req, res, next){
                if(req.query.redirect) req.session.authRedirect = req.query.redirect;
                passport.authenticate('google', { scope: 'profile' })(req, res, next);
            });

            app.get('/auth/google/callback', passport.authenticate('google', { 
                failureRedirect: options.failureRedirect 
            }), function(req, res){
                // only get here on successful authentication
                var redirect = req.session.authRedirect;
                if(redirect) delete req.session.authRedirect;
                res.redirect(303, redirect || options.successRedirect);
            });
        },

    };
};