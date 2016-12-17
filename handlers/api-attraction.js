var Attraction = require('../models/attraction.js');

module.exports = {
    
    list: function(req, res){
        Attraction.find({ approved: true }, function(err, attractions){
            if(err) return res.status(500).send('error: Internal error.');
            res.json(attractions.map(function(item){
                return {
                    name: item.name,
                    id: item._id,
                    description: item.description,
                    location: item.location,
                };
            }));
        });
    },

    detail: function(req, res){
        Attraction.findById(req.params.id, function(err, data){
            if(err) return res.status(500).send('error: Unable to retrieve attraction.');
            res.json({
                name: data.name,
                id: data._id,
                description: data.description,
                location: data.location,
            });
        });
    },

    processPost: function(req, res){    
        var attraction = new Attraction({
            name: req.body.name,
            description: req.body.description,
            location: { lat: req.body.lat, lng: req.body.lng },
            history: {
                event: 'created',
                email: req.body.email,
                date: new Date(),
            },
            approved: false,
        });
        attraction.save(function(err, data){
            if(err) return res.status(500).send('error: Unabe to add attraction.');
            res.json({ id: data._id });
        });
    },

    
};

