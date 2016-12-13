var loadtest = require('loadtest');
var assert = require('chai').assert;

suite('Stress tests', function(){
    test('Homepage should handle 50 requests in a second', function(done){
        var options = {
            url: 'http://localhost:3000',
            concurrency:4,
            maxRequests:50
        };
        loadtest.loadTest(options, function(err, result){
            assert(!err, 'err none');
            assert(result.totalTimeSeconds < 1, 'total elapsed time should be less than 1');
            done();
        });
    });
});