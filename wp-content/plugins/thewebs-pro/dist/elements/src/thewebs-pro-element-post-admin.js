/*global thewebs_elements_params */
;(function ( $, window ) {
	$( '.thewebs-status-toggle' ).on( 'click', function( event ) {
		event.preventDefault();
		var $button = $( this );
		$button.find( '.spinner' ).addClass( 'is-active' );
		$.ajax( {
			type: 'POST',
			url: thewebs_elements_params.ajax_url,
			data: {
				action           : 'thewebs_elements_change_status',
				post_id          : $button.data( 'post-id' ),
				post_status      : $button.data( 'post-status' ),
				security         : thewebs_elements_params.ajax_nonce
			},
			dataType: 'json',
			success: function( response ) {
				$button.find( '.spinner' ).removeClass('is-active');
				if ( response && response.success ) {
					if ( 'publish' === $button.data( 'post-status' ) ) {
						$button.removeClass( 'thewebs-status-publish' );
						$button.addClass( 'thewebs-status-draft' );
						$button.data( 'post-status', 'draft' );
						$button.find( '.thewebs-status-label' ).html( thewebs_elements_params.draft );
					} else {
						$button.removeClass( 'thewebs-status-draft' );
						$button.addClass( 'thewebs-status-publish' );
						$button.data( 'post-status', 'publish' );
						$button.find( '.thewebs-status-label' ).html( thewebs_elements_params.publish );
					}
					$button.closest( 'tr.type-thewebs_element' ).find( '.column-title .post-state' ).hide();
				} else {
					alert( 'Failed to change post status, please reload and try again' );
					window.console.log( response );
				}
			}
		} ).fail( function( response ) {
			$button.find( '.spinner' ).removeClass('is-active');
			alert( 'Failed to change post status, please reload and try again' );
			window.console.log( response );
		} );
	} );

})( jQuery, window );
