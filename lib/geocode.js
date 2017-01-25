var https = require('https'),
    fs = require('fs'),
    path = require('path'),
    pubDir = path.normalize(path.join(__dirname, '..', 'public')),
    Dealer = require('../models/dealer.js');

// initialize dealers
require('../models/mock-dealer.js')();

module.exports = function(){

    var search = function(query, cb){
        var options = {
            hostname: 'maps.googleapis.com',
            path: '/maps/api/geocode/json?address=' + encodeURIComponent(query),
        };
        https.request(options, function(res){
            var data = '';
            res.on('data', function(chunk){
                data += chunk;
            });
            res.on('end', function(){
                data = JSON.parse(data);
                if(data.results.length){
                    cb(null, data.results[0].geometry.location);
                } else {
                    cb("No results found.", null);
                }
            });
        }).end();
    };    

    // dealer cache for Google geocoding
    var dealerCache = {
        lastRefreshed: 0,
        refreshInterval: 60 * 60 * 1000,
        jsonUrl: '/dealers.json',
        geocodeLimit: 2000,
        geocodeCount: 0,
        geocodeBegin: 0,
    };
    
    dealerCache.jsonFile = pubDir + '/' + dealerCache.jsonUrl;

    // dealer geocoding, then saving to DB
    var geocodeDealer = function(dealer){
        var addr = dealer.getAddress(' ');
        // if already geocoded
        if(addr === dealer.geocodedAddress) return;
        
        if(dealerCache.geocodeCount >= dealerCache.geocodeLimit){
            // if has 24 hours passed since last started geocoding
            if(Date.now() <= dealerCache.geocodeBegin + 24 * dealerCache.refreshInterval) return;

            dealerCache.geocodeBegin = Date.now();
            dealerCache.geocodeCount = 0;                
        }
        
        search(addr, function(err, coords){
            if(err) return console.log('Geocoding failure for ' + addr);
            dealer.lat = coords.lat;
            dealer.lng = coords.lng;
            dealer.geocodedAddress = addr;
            dealer.save();
            dealerCache.geocodeCount++;
        });
        
    };

    // optimize performance of dealer display
    var dealersToGoogleMaps = function(dealers){
        var js = 
            'function addMarkers(map){\n' +
            '   var markers = [];\n' +
            '   var Marker = google.maps.Marker;\n' +
            '   var LatLng = google.maps.LatLng;\n';

        dealers.forEach(function(dealer){
            var name = dealer.name.replace(/'/, '\\\'').replace(/\\/, '\\\\');
            js += 
            '   markers.push(new Marker({\n' +
            '   \tposition: new LatLng(' + dealer.lat + ', ' + dealer.lng + '),\n' +
            '   \tmap: map,\n' +
            '   \ttitle: \'' + name.replace(/'/, '\\') + '\',\n' +
            '   }));\n';
        });
        js += 
            '}';
        return js;
    };

    return {

        refresh: function(cb){
            // create empty cache if it doesn't exist to prevent 404 errors
            if(!fs.existsSync(dealerCache.jsonFile)) fs.writeFileSync(dealerCache.jsonFile, JSON.stringify([]));

            if(Date.now() > dealerCache.lastRefreshed + dealerCache.refreshInterval){
                // need to refresh the cache
                Dealer.find({ active: true }, function(err, dealers){
                    if(err) return console.log('Error fetching dealers: ' + err);
                    // geocodeDealer will do nothing if coordinates are up-to-date
                    dealers.forEach(geocodeDealer);
                    // now write all the dealers out to cached JSON file
                    fs.writeFileSync(dealerCache.jsonFile, JSON.stringify(dealers));

                    // make sure data directory exists                
                    fs.writeFileSync(pubDir + '/js/dealers-googleMapMarkers.js', dealersToGoogleMaps(dealers));

                    // all done -- invoke callback
                    cb(dealerCache.refreshInterval);
                });
            }

            //console.log('lastRefreshed: %d, geocodeCount: %d', dealerCache.lastRefreshed, dealerCache.geocodeCount);      
            
        },

    };
    
};