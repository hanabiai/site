var main = require('../controllers/main.js'),
    contest = require('../controllers/contest.js'),
	vacation = require('../controllers/vacation.js'),
	cart = require('../controllers/cart.js'),	
	info = require('../controllers/info.js'),
	samples = require('../controllers/sample.js'),
    customer = require('../controllers/customer.js'),
    auth = require('../controllers/auth.js'),
    cartValidation = require('../lib/cart-validation.js');

module.exports = function(app){
    
    app        
        // miscellaneous routes
        .get('/', main.home)        
        .get('/newsletter', main.newsletter)
        .post('/newsletter', main.newsletterProcessPost)
        .get('/newsletter/archive', main.newsletterArchive)
        .get('/thank-you', main.genericThankYou)        

        // contest routes
        .get('/contest/vacation-photo', contest.vacationPhoto)
        .post('/contest/vacation-photo/:year/:month', contest.vacationPhotoProcessPost)
        .get('/contest/vacation-photo/entries', contest.vacationPhotoEntries)

        // vacation routes
        .get('/vacation', vacation.home)
        .get('/vacation/:slug', vacation.detail)        
        .get('/vacation/notify-in-season', vacation.notifyInSeason)
        .post('/vacation/notify-in-season', vacation.notifyInSeasonProcessPost)
        .get('/vacation/:slug/request-group-rate', vacation.requestGroupRate)
        .post('/vacation/:slug/request-group-rate', vacation.requestGroupRateProcessPost)

        // shopping cart routes
        .get('/cart', cart.middleware, cartValidation.checkWaivers, cartValidation.checkGuestCounts, cart.home)
        .get('/cart/add', cart.addProcessGet)
        .post('/cart/add', cart.addProcessPost)
        .get('/cart/checkout', auth.helpers.isAuthenticated, cart.checkout)
        .post('/cart/checkout', auth.helpers.isAuthenticated, cart.checkoutProcessPost)
        .get('/cart/thank-you', auth.helpers.isAuthenticated, cart.thankYou)
        .get('/email/cart/thank-you', cart.emailThankYou)        
        .get('/set-currency/:currency', cart.setCurrency)

        // contact
        .get('/info/about', info.about)        
        .get('/info/contact', info.home)
	    .post('/info/contact', info.homeProcessPost)
        .get('/dealer', info.dealer)        

        // customer
        .get('/customer/register', customer.register)
		.post('/customer/register', customer.processRegister)
        .get('/customer/:id', customer.home)
        .get('/customer/:id/preferences', customer.preferences)
        .post('/customer/:id/update', customer.ajaxUpdate)
        .get('/orders/:id', customer.orders)        

        // account
        .get('/login', auth.login)
        .get('/logout', auth.logout)
        .get('/unauthorized', auth.unauthorized)
        .get('/unauthentication', auth.unauthentication)
        .get('/account', auth.helpers.allow('customer,employee'), auth.account)
        .get('/account/order-history', auth.helpers.customerOnly, auth.orderHistory)
        .get('/account/email-prefs', auth.helpers.customerOnly, auth.emailPrefs)        
        .get('/account/sales', auth.helpers.employeeOnly, auth.sales)

        // testing/sample routes
        .get('/jquery-test', samples.jqueryTest)
        .get('/nursery-rhyme', samples.nurseryRhyme)
        .get('/data/nursery-rhyme', samples.nurseryRhymeData)
        .get('/epic-fail', samples.epicFail)
        .post('/process', samples.processPost)

    ;
};