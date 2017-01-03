
module.exports = {
    home: function(req, res){
        res.render('dealer', { googleApiKey: process.env.GOOGLE_MAP_APIKEY });
    },
};