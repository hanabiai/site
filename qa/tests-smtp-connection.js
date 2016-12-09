var nodemailer = require('nodemailer');
var credentials = require('../credentials.js');
var assert = require('assert');

var mailTransport = nodemailer.createTransport({
    host: 'smtp.naver.com',
    port: 465,
    secure: true,
    auth: {
        user: credentials.naver.user,
        pass: credentials.naver.password,
    }
});

var msg = 'error';

//Verify SMTP connection configuration
suite('SMTP server connection test', function(){
    test('mailTransport.verify() should return an success', function(done){
        mailTransport.verify(function(error, success){
            if(error) done(error);
            else done();
        });
    });
});
