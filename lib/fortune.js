var fortuneCookies = [
    "aCookie", "bCookie", "cCookie", "dCookie", "eCookie"
];
exports.getFortune = function(){
    var idx = Math.floor(Math.random() * fortuneCookies.length);
    return fortuneCookies[idx];
};