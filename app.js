/**
 * iPlay
 * Copyright 2013 zfkun.com All rights reserved.
 * 
 * @file main
 * @author zfkun(zfkun@msn.com)
 */

var bonjour = require( './src/bonjour' );
var hls = require( './src/hls' );
var tv = require( './src/tv' );
var airplay = require( './src/airplay' );

var app = {
    // browser: null,
    // hls: null,
    // airplay: null
    // service: {}
};

app.log = function () {
    console.log.apply( console, arguments );
    var el = document.getElementById('log');
    el.innerHTML += '<p>' + [].slice.call(arguments).join(' ') + '</p>';
};
app.connectTV = function ( ) {
    if ( !app.service ) {
        app.log( 'AppleTV not found !!' );
        return;
    }
    else if ( app.airplay ) {
        app.log( 'AppleTV had connected !!' );
        return;
    }

    // init AirPlay
    app.airplay = airplay.create({
        host: app.service.addresses[1],
        port: app.service.port
    }).connect(function ( ap ) {
        app.log( 'AppleTV Connected !!' );
    });
};

app.init = function () {
    // 启动一个模拟的 AppleTV
    // this.tv = tv.create().start();

    // hls
    app.hls = hls.create();
    app.hls.on( 'start', function () {
        app.log( 'HLS start, ', this.baseURI );
    }).on( 'stop', function () {
        app.log( 'HLS stop' );
    });
    app.hls.start( 7001 );


    // dns service browser
    app.browser = bonjour.create();
    app.browser.on( 'serviceUp', function( service ) {
        app.log( 'service online:', service );

        if ( !app.service ) {
            app.service = service;
            app.connectTV();
        }

        updateServiceList( service );
    });
    app.browser.start();
    app.log( 'Bonjour start' );



    // TODO: test
    // document.getElementById('tvConnect').onclick = function () {
    //     app.connectTV();
    // };
    document.getElementById('tvPlay').onclick = function () {
        // console.info( app, app.hls, app.browser, app.airplay );
        if ( app.airplay ) {
            app.airplay.play( app.hls.getURI() );
        }
    };

    var droper = document.getElementById( 'drop' );
    droper.addEventListener("dragover", onFileDragOver, false);
    droper.addEventListener("dragleave", onFileDragOver, false);
    droper.addEventListener("drop", onFileDrop, false);

};

app.dispose = function () {
    app.browser.stop();
    app.hls.stop();
    // app.tv.stop();
    document.getElementById('playVideo').onclick = null;
};



function updateServiceList( services ) {
    var select = document.getElementById('services');

    if ( !Array.isArray( services ) ) {
        services = [ services ];
    }

    services.forEach(function ( s ) {
        select.add( new Option( s.name, '' ) );
    });

}


function onFileDragOver( e ) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type === "dragover" ? "hover" : "");
}

function onFileDrop( e ) {
    e.stopPropagation();
    e.preventDefault();

    var file = (e.target.files || e.dataTransfer.files)[0];
    app.log( 'drop video:', file.path );
    app.hls.open( file.path, function ( info ) {
        app.log( 'HLS opened:', info );
    });
}



window.onload = app.init;
window.beforeunload = app.dispose;
