<?php
/**
 * Thewebs functions and definitions
 *
 * This file must be parseable by PHP 5.2.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package thewebs
 */

define( 'THEWEBS_VERSION', '1.1.40' );
define( 'THEWEBS_MINIMUM_WP_VERSION', '5.4' );
define( 'THEWEBS_MINIMUM_PHP_VERSION', '7.2' );

// Bail if requirements are not met.
if ( version_compare( $GLOBALS['wp_version'], THEWEBS_MINIMUM_WP_VERSION, '<' ) || version_compare( phpversion(), THEWEBS_MINIMUM_PHP_VERSION, '<' ) ) {
	require get_template_directory() . '/inc/back-compat.php';
	return;
}
// Include WordPress shims.
require get_template_directory() . '/inc/wordpress-shims.php';

// Load the `thewebs()` entry point function.
require get_template_directory() . '/inc/class-theme.php';

// Load the `thewebs()` entry point function.
require get_template_directory() . '/inc/functions.php';

// Initialize the theme.
call_user_func( 'Thewebs\thewebs' );
 // install plugins
require get_template_directory() . '/install-plugin/thewebs-plugins-install.php';
 // noun function
 require get_template_directory() . '/noun/functions.php';