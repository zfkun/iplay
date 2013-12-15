/**
 * iPlay
 * 
 * @file airplay protocol
 * @author zfkun(zfkun@msn.com)
 */
var emitter = require( 'events' ).EventEmitter;
var util = require( 'util' );
var net = require( 'net' );
var extend = require( './extend' );


function AirPlay( options ) {
    emitter.call( this );

    this.options = extend( {}, options );
    this.pingInterval = 30; // second
}
util.inherits( AirPlay, emitter );



AirPlay.prototype.connect = function ( callback ) {
    var me = this;

    me.socket = net.connect(
        me.options,
        function () {
            // emit
            me.emit( 'connect' );

            // callback
            callback && callback( me );

            // start ping loop
            me.ping();
        }
    );

    me.socket.on( 'data', function( chunk ) {
        me.emit( 'data', chunk );
    });

    me.socket.on( 'end', function() {
        me.emit( 'end' );
    });

    return me;
};

AirPlay.prototype.close = function () {
    clearTimeout( this.pingTimer );
    this.socket.close();
    return this;
};

AirPlay.prototype.ping = function ( force ) {
    if ( !this.pingTimer || force === true ) {
        clearTimeout( this.pingTimer );
        this.pingTimer = setTimeout(
            this.playbackInfo.bind( this ),
            this.pingInterval * 1000
        );
    }
    return this;
};

AirPlay.prototype.playbackInfo = function () {
    if ( !this.socket ) return;

    this.socket.write(
        'GET /playback-info HTTP/1.1\r\n' +
        // 'Host: 192.168.1.2:7000\r\n' +
        'Content-Length:0\r\n'
    );

    console.log( 'ping /playback-info..' );

    return this;
};

AirPlay.prototype.play = function ( url, position ) {
    position = position || '0.000000';

    var body = 'Content-Location: ' + url + '\n'
             + 'Start-Position: ' + position + '\n';

    this.socket.write(
        'POST /play HTTP/1.1\r\n' +
        // 'Host: 192.168.1.2:7000\r\n' +
        // 'Connection: keep-alive\r\n' +
        'Content-Length: ' + body.length + '\r\n' +
        '\r\n' +
        body
    );

    console.log( 'play: %s, from %s', url, position );

    return this;
};



// new AirPlay({
//     host: '192.168.1.2',
//     port: 7000
// }).connect( function ( ap ) {
//     ap.play( 'http://192.168.1.7:7001/' );
// })
// .on( 'data', function ( chunk ) {
//     console.log( 'data:', chunk.toString() );
// }).on( 'end', function () {
//     console.log( 'end' );
// });


exports.create = function ( options ) {
    return new AirPlay( options );
};

