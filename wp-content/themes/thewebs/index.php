<?php
/**
 * The main archive template file
 *
 * @package thewebs
 */

namespace Thewebs;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

thewebs()->print_styles( 'thewebs-content' );
/**
 * Hook for main archive content.
 */
do_action( 'thewebs_archive' );

get_footer();
