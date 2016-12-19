module.exports = {

    contextProperty: '_bundles',
    use: {
        desktop: function(req, res){
            return !req.isMobile;
        },
        mobile: function(req, res){
            return req.isMobile;
        }
    },
    bundles: {
        clientJavaScript: {
            desktop: {
                file: '/js/meadowlark.min.js',
                location: 'beforeCloseBody',
                contents: [
                    '/js/contact.js',
                    '/js/cart.js',
                ]
            },
            mobile: {
                file: '/js/meadowlark.min.js',
                location: 'beforeCloseBody',
                contents: [
                    '/js/contact.js',
                    '/js/cart.js',
                ]
            }
        },
        clientCss: {            
            desktop: {
                file: '/css/meadowlark.min.css',
                contents: [
                    '/css/main.css',
                    '/css/cart.css',
                ]
            },
            mobile: {
                file: '/css/meadowlark.min.css',
                contents: [
                    '/css/main.css',
                    '/css/cart.css',
                ]
            }
        }
    },
    
};