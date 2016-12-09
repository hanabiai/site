var nodemailer = require('nodemailer');

module.exports = function(credentials){
    var mailTransport = nodemailer.createTransport({
        host: 'smtp.naver.com',
        port: 465,
        secure: true,
        auth: {
            user: credentials.naver.user,
            pass: credentials.naver.password,
        }
    });

    var from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
    return {
        send: function(to, subj, body){
            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function(err){
                if(err) console.error('Unable to send email: ' + err);
            });
        },        
    };
};