var main = require('./handlers/main.js'),
    contest = require('./handlers/contest.js'),
	vacation = require('./handlers/vacation.js'),
	cart = require('./handlers/cart.js'),	
	contact = require('./handlers/contact.js'),
	samples = require('./handlers/sample.js'),
    cartValidation = require('./lib/cart-validation.js'),
    cors = require('cors'),
    attraction = require('./handlers/api-attraction.js');

module.exports = function(app){
    
    app
        // miscellaneous routes
        .get('/', main.home)
        .get('/about', main.about)
        .get('/newsletter', main.newsletter)
        .post('/newsletter', main.newsletterProcessPost)
        .get('/newsletter/archive', main.newsletterArchive)
        .get('/thank-you', main.genericThankYou)

        // contest routes
        .get('/contest/vacation-photo', contest.vacationPhoto)
        .post('/contest/vacation-photo/:year/:month', contest.vacationPhotoProcessPost)
        .get('/contest/vacation-photo/entries', contest.vacationPhotoEntries)

        // vacation routes
        .get('/vacation/:vacation', vacation.detail)
        .get('/vacations', vacation.list)
        .get('/notify-in-season', vacation.notifyInSeason)
        .post('/notify-in-season', vacation.notifyInSeasonProcessPost)

        // shopping cart routes
        .get('/cart', cart.middleware, cartValidation.checkWaivers, cartValidation.checkGuestCounts, cart.home)
        .get('/cart/add', cart.addProcessGet)
        .post('/cart/add', cart.addProcessPost)
        .get('/cart/checkout', cart.checkout)
        .post('/cart/checkout', cart.checkoutProcessPost)
        .get('/cart/thank-you', cart.thankYou)
        .get('/email/cart/thank-you', cart.emailThankYou)        
        .get('/set-currency/:currency', cart.setCurrency)

        // contact
        .get('/tours/request-group-rate', contact.requestGroupRate)
        .post('/tours/request-group-rate', contact.requestGroupRateProcessPost)
        .get('/contact', contact.home)
	    .post('/contact', contact.homeProcessPost)

        // testing/sample routes
        .get('/jquery-test', samples.jqueryTest)
        .get('/nursery-rhyme', samples.nurseryRhyme)
        .get('/data/nursery-rhyme', samples.nurseryRhymeData)
        .get('/epic-fail', samples.epicFail)
        .post('/process', samples.processPost)

        // express apis - attraction
        .get('/api/attractions', cors(), attraction.list)
        .get('/api/attraction/:id', cors(), attraction.detail)
        .post('/api/attraction', cors(), attraction.processPost)
                
    ;
};