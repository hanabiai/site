var fs = require('fs'),
    path = require('path'),
    formidable = require('formidable');

// make sure data directory exists
var dataDir = path.normalize(path.join(__dirname, '..', 'data'));
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

//
function saveContestEntry(contestName, email, year, month, photoPath){
    // TODO...this will come later
}

module.exports = {
    
    vacationPhoto: function(req, res){
        var now = new Date();
        res.render('contest/vacation-photo', {
            year: now.getFullYear(), 
            month: now.getMonth()
        });
    },
    
    vacationPhotoProcessPost: function(req, res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files){
            if(err) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing ur submission. Plz try again.',
                };
                return res.redirect(303, '/contest/vacation-photo');
            }

            var photo = files.fieldPhoto;
            var vacationPhotoDir = path.join(dataDir, 'vacation-photo');
            var dir = vacationPhotoDir + '/' + fields.fieldName;
            var filePath = dir + '/' + photo.name;
            if(!fs.existsSync(vacationPhotoDir)) fs.mkdirSync(vacationPhotoDir);
            if(!fs.existsSync(dir)) fs.mkdirSync(dir);
            fs.renameSync(photo.path, filePath);
            saveContestEntry('vacation-photo', fields.fieldEmail, req.params.year, req.params.month, filePath);
            req.session.flash = {
                type: 'success',
                intro: 'Good luck!',
                message: 'U have been entered into the contest.',
            };
            return res.redirect(303, '/contest/vacation-photo/entries');
        });
    },
    
    vacationPhotoEntries: function(req, res){
        res.render('contest/vacation-photo/entries');
    },

};