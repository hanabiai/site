var mongoose = require('mongoose');
var newsletterSchema = mongoose.Schema({
    name: String,
    email: String,
});
module.exports = mongoose.model('Newsletter', newsletterSchema);