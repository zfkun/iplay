/**
 * iPlay
 * 
 * @file Bonjour Server
 * @author zfkun(zfkun@msn.com)
 */
var mdns = require('mdns');

exports.create = function ( options ) {
    var browser = mdns.createBrowser( mdns.tcp( 'airplay' ), options );
    return {

        start: function () {
            browser.start();
            return this;
        },

        stop: function() {
            browser.stop();
            return this;
        },

        on: function ( events, fn ) {
            events.split( ',' ).forEach(function ( ev ) {
                browser.on( ev, fn );
            });
            return this;
        }

    };
};
