<?php
/**
 * The main single item template file.
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
 * Hook for everything, makes for better elementor theming support.
 */
do_action( 'thewebs_single' );

get_footer();
