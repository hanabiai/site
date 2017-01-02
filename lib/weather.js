var credentials = require('../credentials.js');
var Q = require('q');
var http = require('http');

// Weather Underground data
module.exports = function(){    

    //
    var c = {
        refreshed: 0,
        refreshing: false,
        updateFrequency: 3600000,
        locations: [
            { name: 'Portland' },
            { name: 'Bend' },
            { name: 'Manzanita' },
        ]
    };

    (function(){
        if(!c.refreshing && Date.now() > c.refreshed + c.updateFrequency){
            c.refreshing = true;
            var promises = c.locations.map(function(loc){
                return Q.Promise(function(resolve){
                    var url = 'http://api.wunderground.com/api/' +
                        credentials.weatherUnderground[process.env.NODE_ENV || 'development'].apiKey +
                        '/conditions/q/OR/' + loc.name + '.json';
                    http.get(url, function(res){
                        var body = '';
                        res.on('data', function(chunk){
                            body += chunk;
                        });
                        res.on('end', function(){
                            body = JSON.parse(body);
                            loc.forecastUrl = body.current_observation.forecast_url;
                            loc.iconUrl = body.current_observation.icon_url;
                            loc.weather = body.current_observation.weather;
                            loc.temp = body.current_observation.temperature_string;
                            resolve();
                        });
                    });
                });
            });
            Q.all(promises).then(function(){
                c.refreshing = false;
                c.refreshed = Date.now();
            });
        }
        
    })();

    return {

        getWeatherData: function(){
            return { locations: c.locations };
        },

    };        
    
};