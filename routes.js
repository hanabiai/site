var main = require('./controllers/main.js'),
    contest = require('./controllers/contest.js'),
	vacation = require('./controllers/vacation.js'),
	cart = require('./controllers/cart.js'),	
	contact = require('./controllers/contact.js'),
	samples = require('./controllers/sample.js'),
    customer = require('./controllers/customer.js'),
    auth = require('./controllers/auth.js'),
    dealer = require('./controllers/dealer.js'),
    cartValidation = require('./lib/cart-validation.js');

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

        // customer
        .get('/customer/register', customer.register)
		.post('/customer/register', customer.processRegister)
        .get('/customer/:id', customer.home)
        .get('/customer/:id/preferences', customer.preferences)
        .get('/orders/:id', customer.orders)
        .post('/customer/:id/update', customer.ajaxUpdate)

        // auth

        .get('/unauthorized', auth.unauthorized)
        .get('/account', auth.helpers.allow('customer,employee'), auth.account)
        .get('/account/order-history', auth.helpers.customerOnly, auth.orderHistory)
        .get('/account/email-prefs', auth.helpers.customerOnly, auth.emailPrefs)        
        .get('/sales', auth.helpers.employeeOnly, auth.sales)

        

        // dealer
        .get('/dealer', dealer.home)
                
    ;
};