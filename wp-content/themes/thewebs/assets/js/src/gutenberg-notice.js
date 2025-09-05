/**
 * Ajax install the Theme Plugin
 *
 */
(function($, window, document, undefined){
	"use strict";
	$(function(){
		$( '#thewebs-notice-gutenberg-plugin .notice-dismiss' ).on( 'click', function( event ) {
			thewebs_dismissGutenbergNotice();
		} );
		function thewebs_dismissGutenbergNotice(){
			var data = new FormData();
			data.append( 'action', 'thewebs_dismiss_gutenberg_notice' );
			data.append( 'security', thewebsGutenbergDeactivate.ajax_nonce );
			$.ajax({
				url : thewebsGutenbergDeactivate.ajax_url,
				method:  'POST',
				data: data,
				contentType: false,
				processData: false,
			});
		}
	});
})(jQuery, window, document);