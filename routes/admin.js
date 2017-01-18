var auth = require('../controllers/auth.js'),
    main = require('../controllers/admin-main.js');

module.exports = function(admin){
    
    // create admin routes; 
    admin
        .get('/', auth.helpers.adminOnly, main.home);

};