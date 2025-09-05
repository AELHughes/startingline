<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package thewebs
 */

namespace Thewebs;

get_header();

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

thewebs()->print_styles( 'thewebs-content' );
/**
 * Hook for everything, makes for better elementor theming support.
 */
do_action( 'thewebs_single' );

get_footer();
