<?php
/**
 * Template part for displaying a search.
 *
 * @package thewebs
 */

namespace Thewebs;

if ( function_exists( 'is_bbpress' ) && is_bbpress() ) {
	bbp_get_template_part( 'form', 'search' );
} else {
	get_search_form();
}
