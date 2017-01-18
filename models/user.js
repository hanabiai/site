var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    authId: String,
    name: String,
    email: String,
    provider: String,
    role: String,
    created: Date,
});
module.exports = mongoose.model('User', userSchema);