module.exports = {

    VALID_EMAIL_REGEX : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
        
    convertFromUSD: function(value, currency){
        switch(currency){            
            case 'gbp': return (value / 100 * 0.6).toFixed(2);
            case 'btc': return (value / 100 * 0.0023707918444761).toFixed(2);
            default: return (value / 100 * 1).toFixed(2);
        }
    },

    smartJoin: function(arr, seperator) {
        if(!seperator) seperator = ' ';
        return arr.filter(function(item){
            return item !== undefined && item !== null && item.toString().trim() !== '';
        }).join(seperator);
    },

};