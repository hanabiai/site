var http = require('http');
var assert = require('chai').assert;
var restler = require('restler');

suite('API tests', function(){

    var attraction = {
        lat: 45.516011,
        lng: -122.682062,
        name: 'Portland Art Museum(fixup)',
        description: 'Founded in 1892, the Portland Art Museum\'s colleciton ' +
            'of native art is not to be missed.  If modern art is more to your ' +
            'liking, there are six stories of modern art for your enjoyment.',
        email: 'test@meadowlarktravel.com',
    };

    var base = 'http://localhost:3000';
    // get request test
    // using post request first for following reasons...
    // 1. asyncronous call not guaranteeing calling order
    // 2. any test must be independant
    test('should be able to retrieve an attraction', function(done){
        restler.post(base + '/api/attraction', { data: attraction }).on('success', function(doc){
            restler.get(base + '/api/attraction/' + doc.id).on('success', function(doc){
                assert.strictEqual(doc.name, attraction.name);
                assert.strictEqual(doc.description, attraction.description);                
                done();
            });
        });
    });
});