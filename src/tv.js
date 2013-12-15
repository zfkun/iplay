/**
 * iPlay
 * 
 * @file apple tv server
 * @author zfkun(zfkun@msn.com)
 */
var mdns = require('mdns');

exports.create = function () {
    var txt_record = {
        deviceid: '58:55:CA:1A:E2:88',
        features: 0x39f7,
        model: 'AppleTV2,1',
        srcvers: '130.14'
    };
    var ad = mdns.createAdvertisement(
            mdns.tcp('airplay'),
            8888,
            { textRecord: txt_record }
    );

    return {

        start: function () {
            ad.start();

            console.log( '模拟AppTV启动' );

            return this;
        },

        stop: function() {
            ad.stop();

            return this;
        }

    };
};