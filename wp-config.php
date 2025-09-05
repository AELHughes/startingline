<?php
define( 'WP_CACHE', true );

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Load local configuration if it exists ** //
if ( file_exists( dirname( __FILE__ ) . '/wp-config-local.php' ) ) {
	include( dirname( __FILE__ ) . '/wp-config-local.php' );
} else {
	// ** Production Database settings ** //
	/** The name of the database for WordPress */
	define( 'DB_NAME', 'startix3e5q2_wp_hvham' );

	/** Database username */
	define( 'DB_USER', 'startix3e5q2_wp_u4cg4' );

	/** Database password */
	define( 'DB_PASSWORD', 'Q8cm&_hEI8IJ2@y0' );

	/** Database hostname */
	define( 'DB_HOST', 'localhost:3306' );
}

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'F4;79i2A/W0--/+78g#5FEViRj6r7022rz2/#]5]*]iqt7w|HbLh~a5SDg*Ez_q:');
define('SECURE_AUTH_KEY', '[Z(1S;9!Cj6YHH%u83ZS&s1BSn8Q56i@5*I42NIT@+~5[zj*8kidW4:AuXbD&yY1');
define('LOGGED_IN_KEY', '%AZz0ehzaKY9S)7/C87LI4+F+P]3J:27@@5&aI2vRz8Jw2B~0k~qF4)su+2q%Ep0');
define('NONCE_KEY', 'Ux!29zljd3H8l4!x25581TU:fSd2PpfDMlS0bUVl_m@oo34mk7a/|6v-N)6Ob)aJ');
define('AUTH_SALT', 'W!20XC;#NF027u/Q0RL!5)TlTi4p_Yg68!q|8q4d/2@WT6n4I7*~4uvt:oi/183y');
define('SECURE_AUTH_SALT', 'M1Y:Z@5%O2~3v5075]USLWk40sL617HA0+*9ephxhh%oCiz0]g(7LFj&+E)Lto99');
define('LOGGED_IN_SALT', '[3wYd6U03k[F&I:*52]-95-PR&Q/l2C0hr2Xk+7fxw*VF3n93gNTcn~:OA|-cR9V');
define('NONCE_SALT', 'Fxw&6jqhQpb81W1z0Ve;M4+g9QtPAnx5QI0_AO6l)Z&i5%+18IFN#65Ru~:8l5(g');


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'IULLNPS_';


/* Add any custom values between this line and the "stop editing" line. */

define('WP_ALLOW_MULTISITE', true);
/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

// Log errors to /wp-content/debug.log (recommended)
define('WP_DEBUG_LOG', true);

// Show errors on the page (turn OFF on production)
define('WP_DEBUG_DISPLAY', true);

// Optional: show more detailed script notices
define('SCRIPT_DEBUG', true);

// (Optional) If a plugin/theme causes a white screen, disable the fatal error handler to see raw errors
// define('WP_DISABLE_FATAL_ERROR_HANDLER', true);
@ini_set('display_errors', 1);

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

/** Google API Key for Create Event */
define('FOOP_GOOGLE_MAPS_KEY', 'AIzaSyBeVo0iIne8WEVFXBOurttPYGmbc0MYTYc');
