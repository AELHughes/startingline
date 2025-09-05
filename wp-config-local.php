<?php
/**
 * Local development configuration for WordPress
 * 
 * This file contains settings for local development.
 * It will be included by wp-config.php when developing locally.
 */

// ** Local Database settings ** //
define( 'DB_NAME', 'startingline_local' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', '' ); // Update this with your local MySQL password
define( 'DB_HOST', 'localhost' );

// ** Debug settings for local development ** //
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', true );
}
if ( ! defined( 'WP_DEBUG_LOG' ) ) {
	define( 'WP_DEBUG_LOG', true );
}
if ( ! defined( 'WP_DEBUG_DISPLAY' ) ) {
	define( 'WP_DEBUG_DISPLAY', false );
}
if ( ! defined( 'SCRIPT_DEBUG' ) ) {
	define( 'SCRIPT_DEBUG', true );
}

// ** Local URLs ** //
define( 'WP_HOME', 'http://localhost:8000' );
define( 'WP_SITEURL', 'http://localhost:8000' );

// ** Security settings for local development ** //
define( 'DISALLOW_FILE_EDIT', false ); // Allow file editing in local development

// ** Performance settings for local development ** //
if ( ! defined( 'WP_CACHE' ) ) {
	define( 'WP_CACHE', false ); // Disable caching during development
}

// ** Email settings for local development ** //
// Prevent emails from being sent during local development
define( 'WP_MAIL_SMTP_DISABLE', true );

// ** Plugin settings for local development ** //
// Add any plugin-specific local settings here

?>
