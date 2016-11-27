var fortuneCookies = [
    "a", "b", "c", "d", "e"
];
exports.getFortune = function(){
    var idx = Math.floor(Math.random() * fortuneCookies.length);
    return fortuneCookies[idx];
}