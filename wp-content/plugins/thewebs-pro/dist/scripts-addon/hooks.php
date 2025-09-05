<?php
/**
 * Class for the Customizer
 *
 * @package Thewebs
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;

/**
 * Output header scripts.
 */
function header_scripts() {
	$script = thewebs()->option( 'header_scripts' );
	if ( ! empty( $script ) ) {
		echo $script;
	}
}
add_action( 'wp_head', 'Thewebs_Pro\header_scripts', 50 );

/**
 * Output after body scripts.
 */
function after_body_scripts() {
	$script = thewebs()->option( 'after_body_scripts' );
	if ( ! empty( $script ) ) {
		echo $script;
	}
}
add_action( 'wp_body_open', 'Thewebs_Pro\after_body_scripts', 50 );

/**
 * Output footer scripts.
 */
function footer_scripts() {
	$script = thewebs()->option( 'footer_scripts' );
	if ( ! empty( $script ) ) {
		echo $script;
	}
}
add_action( 'wp_footer', 'Thewebs_Pro\footer_scripts', 50 );
