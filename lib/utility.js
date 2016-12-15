module.exports = {

    VALID_EMAIL_REGEX : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
        
    convertFromUSD: function(value, currency){
        switch(currency){
            case 'USD': return 'USD: ' + (value / 100 * 1).toFixed(2);
            case 'GBP': return 'GBP: ' + (value / 100 * 0.6).toFixed(2);
            case 'BTC': return 'BTC: ' + (value / 100 * 0.0023707918444761).toFixed(2);
            default: return NaN;
        }
    },

};