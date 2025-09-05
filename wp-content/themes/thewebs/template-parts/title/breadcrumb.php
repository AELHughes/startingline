<?php
/**
 * Template part for displaying a post's breadcrumb.
 *
 * @package thewebs
 */

namespace Thewebs;

$item_type = get_post_type();
$elements  = thewebs()->option( $item_type . '_title_element_breadcrumb' );
$args = array( 'show_title' => true );
if ( isset( $elements ) && is_array( $elements ) ) {
	if ( isset( $elements['show_title'] ) && ! $elements['show_title'] ) {
		$args['show_title'] = false;
	}
}
thewebs()->print_breadcrumb( $args );