var cors = require('cors'),
    attraction = require('../controllers/api-attraction.js');

module.exports = function(apiRouter){
    apiRouter
        .use(cors())
        // express apis - attraction        
        .get('/attractions', attraction.list)
        .get('/attraction/:id', attraction.detail)
        .post('/attraction', attraction.processPost)
        ;
};