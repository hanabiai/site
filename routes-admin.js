var main = require('./controllers/admin-main.js');

module.exports = function(admin){
    
    // create admin routes; 
    admin
        .get('/', main.home);

};