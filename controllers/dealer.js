var credentials = require('../credentials.js');

module.exports = {
    home: function(req, res){
        res.render('dealer', { googleApiKey: credentials.google[process.env.NODE_ENV || 'development'].apiKey });
    },
};