module.exports = {
    
    jqueryTest: function(req, res){
        res.render('jquery-test');
    },
    
    nurseryRhyme: function(req, res){
        res.render('nursery-rhyme');
    },
    
    nurseryRhymeData: function(req, res){
        res.json({
            animal: 'squirrel',
            bodyPart: 'tail',
            adjective: 'bushy',
            noun: 'heck'
        });
    },
    
    epicFail: function(req, res){
        process.nextTick(function(){
            throw new Error('kaboom!');
        });
    },
    
    processPost: function(req, res){
        if(req.xhr || req.accepts('json,html') === 'json'){
            res.send({ success: true });
        } else {
            res.redirect(303, '/thank-you');
        }        
    },

};