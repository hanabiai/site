var https = require('https');
var querystring = require('querystring');

module.exports = function(twitterOptions){

    // this variable, function will be invisible outside of this module
    var accessToken;

    var getAccessToken = function(cb){
        if(accessToken) return cb(accessToken);
        
        var bearerToken = Buffer(
            encodeURIComponent(twitterOptions.consumerKey) + ':' + 
            encodeURIComponent(twitterOptions.consumerSecret)
        ).toString('base64');

        var options = {
            hostname: 'api.twitter.com',
            port: 443,
            method: 'POST',
            path: '/oauth2/token?grant_type=client_credentials',
            headers: {
                'Authorization': 'Basic ' + bearerToken,
            },
        };

        https.request(options, function(res){
            var data = '';
            res.on('data', function(chunk){
                data += chunk;
            });
            res.on('end', function(){
                var auth = JSON.parse(data);
                if(auth.token_type !== 'bearer'){
                    console.log('Twitter auth failed.');
                    return;
                }
                accessToken = auth.access_token;
                cb(accessToken);
            });
        }).end();

    };

    var search = function(query, count, cb){
        // TODO
        getAccessToken(function(accessToken){
            var options = {
                hostname: 'api.twitter.com',
                port: 443,
                method: 'GET',
                path: '/1.1/search/tweets.json?q=' + encodeURIComponent(query) + '&count=' + (count || 10),
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                },
            };

            https.request(options, function(res){
                var data = '';
                res.on('data', function(chunk){
                    data += chunk;
                });
                res.on('end', function(){
                    cb(JSON.parse(data));
                });
            }).end();
        });
    };
    
    var embed = function(statusId, options, cb){
        if(typeof options === 'function'){
            cb = options;
            options = {};
        }
        options.id = statusId;
        getAccessToken(function(accessToken){
            var requestOptions = {
                hostname: 'api.twitter.com',
                port: 443,
                method: 'GET',
                path: '/1.1/statuses/oembed.json?' + querystring.stringify(options),
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                },
            };

            https.request(requestOptions, function(res){
                var data = '';
                res.on('data', function(chunk){
                    data += chunk;
                });
                res.on('end', function(){
                    cb(JSON.parse(data));
                });
            }).end();
        });
    };
    
    var topTweets = {
        count: 10,
        lastRefreshed: 0,
        refreshInterval: 15 * 60 * 1000,
        tweets: [],
    };

    (function(cb){
        if(Date.now() > topTweets.lastRefreshed + topTweets.refreshInterval){

            search('#travel', topTweets.count, function(result){
                var formattedTweets = [];        
                var embedOpts = { omit_script: 1 };
                var promises = result.statuses.map(function(status){
                    return new Promise(function(resolve){
                        embed(status.id_str, embedOpts, function(embed){
                            formattedTweets.push(embed.html);
                            resolve();
                        });
                    });
                });

                Promise.all(promises).then(function(){
                    topTweets.lastRefreshed = Date.now();
                    topTweets.tweets = formattedTweets;
                    //cb(topTweets.tweets = formattedTweets);
                });
            });

        }
    })();

    return {
        
        getTopTweets: function(){
            return topTweets.tweets;
        },
        
    };
};