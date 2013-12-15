/**
 * iPlay
 * 
 * @file extend
 * @author zfkun(zfkun@msn.com)
 */
module.exports = function ( target ) {
    for ( var i = 1; i < arguments.length; i++ ) {
        var src = arguments[ i ];
        if ( src == null ) {
            continue;
        }
        for ( var key in src ) {
            if ( src.hasOwnProperty( key ) ) {
                target[ key ] = src[ key ];
            }
        }
    }
    return target;
};