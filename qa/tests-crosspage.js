var Browser = require('zombie');
var assert = require('chai').assert;
var browser;

suite('Cross-Page Tests', function(){
    setup(function(){
        browser = new Browser();
    });
    //test for hood-river tour page link
    test('requesting a group rate from the hood-river tour page should populate the referer field', function(done){
        var referer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referer, function(){
            browser.clickLink('.requestGroupRate', function(){
                assert(browser.field('referer').value === referer);
                done();
            });
        });
    });
    //test for oregon-coast tour page link
    test('requesting a group rate from the oregon-coast tour page should populate the referer field', function(done){
        var referer = 'http://localhost:3000/tours/oregon-coast';
        browser.visit(referer, function(){
            browser.clickLink('.requestGroupRate', function(){
                assert(browser.field('referer').value === referer);
                done();
            });
        });
    });
    //test for direct access request group rate page
    test('visiting the "request group rate" page directly should result in an empty referer field', function(done){
        browser.visit('http://localhost:3000/tours/request-group-rate', function(){
            assert(browser.field('referer').value === '');
            done();
        });
    });
});