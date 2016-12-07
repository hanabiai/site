var weatherInfo = require('../lib/weather.js');
var assert = require('chai').assert;

suite('Weather Underground test', function(){
    test('getWeatherData() should return locations.length 3', function(){
        assert.strictEqual(weatherInfo.getWeatherData().locations.length, 3);
    });

    test('getWeatherData() should return locations[1].name Bend', function(){
        assert.strictEqual(weatherInfo.getWeatherData().locations[1].name, 'Bend');
    });
});