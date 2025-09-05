/* global thewebsProInfiniteConfig */
/**
 * File post-infinite-scroll.js.
 * Gets single post infinite scroll working.
 */

(function() {
	'use strict';
	window.thewebsProSingleInfinite = {
		getPath: function() {
			//console.log( this );
			var slug = thewebsProInfiniteConfig.slugs[ this.loadCount ];
			if ( slug ) {
				return slug;
			}
		},
		// Initiate scroll when the DOM loads.
		init: function() {
			var infScroll = new InfiniteScroll( '.content-wrap', {
				path: window.thewebsProSingleInfinite.getPath,
				append: '.single-entry',
				status: '.page-load-status',
			} );
		}
	}
	if ( 'loading' === document.readyState ) {
		// The DOM has not yet been loaded.
		document.addEventListener( 'DOMContentLoaded', window.thewebsProSingleInfinite.init );
	} else {
		// The DOM has already been loaded.
		window.thewebsProSingleInfinite.init();
	}
})();