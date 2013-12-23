/**
 * iPlay
 * Copyright 2013 zfkun.com All rights reserved.
 * 
 * @file main
 * @author zfkun(zfkun@msn.com)
 */
var airplay = require( 'airplay' );

var app = {
    // browser: null,
    // hls: null,
    // device: {}
};

app.log = function () {
    console.log.apply( console, arguments );
    var el = document.getElementById('log');
    el.innerHTML += '<p>' + [].slice.call(arguments).join(' ') + '</p>';
};

app.init = function () {
    // browser
    app.initBrowser();

    // droper
    app.initDroper();

    // controller
    app.initController();
};

app.initHLS = function () {
    app.hls = airplay.createHLS();
    app.hls.on( 'start', function () {
        app.log( 'HLS start, ', this.baseURI );
    });
    app.hls.on( 'stop', function () {
        app.log( 'HLS stop' );
    });
    app.hls.on( 'stream', function ( index, size ) {
        app.videoSegmentIndex = index;
        app.videoSegmentSize = size;
    });
    app.hls.start( 7001 );
};

app.initBrowser = function () {
    app.browser = airplay.createBrowser();
    app.browser.on( 'deviceOn', function( device ) {
        app.log( 'device online:', device.getInfo() );

        app.device = device;
        app.device.on( 'ping', function () { app.log( 'device pingback ~' ); });
        app.log( 'AppleTV Connected !!' );
        
        app.updateList( device.getInfo() );

        app.initHLS();
    });
    app.browser.on( 'start', function () {
        app.log( 'Browser start' );
    });
    app.browser.on( 'stop', function () {
        app.log( 'Browser stop' );
    });
    app.browser.start();
};

app.initDroper = function () {
    var droper = document.getElementById( 'drop' );
    droper.addEventListener( 'dragover', onFileDrag, false );
    droper.addEventListener( 'dragleave', onFileDrag, false );
    droper.addEventListener( 'drop', onFileDrop, false );

    function onFileDrag( e ) {
        e.preventDefault();
        e.target.className = (e.type === "dragover" ? "hover" : "");
    }

    function onFileDrop( e ) {
        e.preventDefault();

        var file = (e.target.files || e.dataTransfer.files)[0];
        app.log( 'drop video:', file.path );

        app.hls.open( file.path, function ( info ) {
            app.log( 'HLS opened:', info );
        });
    }
};

app.initController = function () {
    var isPlaying = 0;
    document.getElementById('tvPlay').onclick = function () {
        if ( !app.device ) return;

        // console.info( app, app.hls, app.browser, app.airplay );
        if ( isPlaying === 0) {
            this.textContent = '暂停';
            app.device.play( app.hls.getURI(), 0, function () {
                console.info( '开始播放啦~~' );
                app.updateStatus();
                isPlaying = 1;
            });
        }
        // NOTE: only 0 and 1 seem to be supported for most media types
        // rate: 0 = pause, 1 = resume
        else if ( isPlaying === 1 ) {
            this.textContent = '播放';
            app.device.rate( 0, function () {
                console.info( '暂停播放啦~~' );
                isPlaying = 2;
            });    
        }
        else if ( isPlaying === 2 ) {
            this.textContent = '暂停';
            app.device.rate( 1, function ( res ) {
                console.info( '恢复播放啦~~' );
                isPlaying = 1;
            });
        }
    };
    document.getElementById('tvStop').onclick = function () {
        if ( !app.device ) return;

        document.getElementById('tvPlay').textContent = '播放';
        app.device.stop( function () {
            console.info( '终止播放啦~~' );
            isPlaying = 0;

            clearTimeout( app.statusTimer );
        });
    };
};

app.dispose = function () {
    app.browser.stop();
    app.hls.stop();
    document.getElementById( 'playVideo' ).onclick = null;
    app.browser = null;
    app.hls = null;
    app.device = null;
};

app.updateList = function ( deviceInfo ) {
    var select = document.getElementById( 'devices' );
    select.add( new Option( deviceInfo.name, '' ) );
};

app.updateStatus = function () {
    app.device.status( function ( info ) {
        // console.log( 'playstatus:', info );

        // 正在播放时才更新
        if ( info && info.readyToPlay ) {
            var out = '';
            out +=
                '<p>' +
                '播放进度: ' +
                Math.ceil( info.position ) +
                ' / ' +
                info.duration +
                '</p>';

            if ( info.loadedTimeRanges ) {
                out +=
                    '<p>' +
                    '加载进度: ' +
                    Math.ceil(
                        info.loadedTimeRanges[0].start +
                        info.loadedTimeRanges[0].duration
                    ) +
                    ' / ' +
                    info.duration +
                    '</p>';
            }

            out +=
                '<p>' +
                '分段进度：' +
                ( app.videoSegmentIndex || 0 ) + 
                ' / ' +
                ( app.videoSegmentSize || 1 ) +
                '</p>';

            var node = document.querySelector('.control .status');
            node.innerHTML = out;
        }

        // next
        app.statusTimer = setTimeout( app.updateStatus.bind( app ), 1000 );
    });
};




window.onload = app.init;
window.beforeunload = app.dispose;
