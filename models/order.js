var mongoose = require('mongoose');
var orderSchema = mongoose.Schema({
	/* TODO */
    customerId: String,
    date: Date,
    status: String,
});
var Order = mongoose.model('Order', orderSchema);
module.exports = Order;
