// mocking NewsletterSignup:
module.exports = function(){
    return {
        save: function(cb){
            cb();
        }
    };
};
