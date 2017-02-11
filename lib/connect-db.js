var credentials = require('../credentials.js');
// configure database for mongoose
var mongoose = require('mongoose');
var opts = {
    server: {
        //poolSize: 5,
        socketOptions: { keepAlive: 1 }
    }
};
var nodeEnv = process.env.NODE_ENV || 'development';

mongoose.Promise = global.Promise;

switch(nodeEnv){    
    case 'production':        
        mongoose.connect(process.env.MONGOLAB_CONNSTRING, opts);
        break;
    default:
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
}

module.exports = function(){
    return mongoose;
};