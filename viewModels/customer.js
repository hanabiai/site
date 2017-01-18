var utility = require('../lib/utility.js');

module.exports = function(customer, orders){
    return {
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: utility.smartJoin([customer.firstName, customer.lastName]),
        email: customer.email,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        fullAddress: utility.smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' + customer.state + ' ' + customer.zip,
        ], '<br>'),
        phone: customer.phone,
        orders: orders.map(function(order){
            return {
                orderNumber: order._id,
                date: order.date,
                status: order.status,
                url: '/orders/' + order._id,
            };
        }),
    };
};