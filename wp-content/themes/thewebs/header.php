<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package thewebs
 */

namespace Thewebs;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>
<!doctype html>
<html <?php language_attributes(); ?> class="no-js" <?php thewebs()->print_microdata( 'html' ); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div class="pageloader"></div>
<?php wp_body_open(); ?>
<?php
/**
 * Thewebs before wrapper hook.
 */
do_action( 'thewebs_before_wrapper' );
?>
<div id="wrapper" class="site wp-site-blocks">
	<?php
	/**
	 * Thewebs before header hook.
	 *
	 * @hooked thewebs_do_skip_to_content_link - 2
	 */
	do_action( 'thewebs_before_header' );

	/**
	 * Thewebs header hook.
	 *
	 * @hooked Thewebs/header_markup - 10
	 */
	do_action( 'thewebs_header' );

	do_action( 'thewebs_after_header' );
	?>

	<div id="inner-wrap" class="wrap hfeed kt-clear">
		<?php
		/**
		 * Hook for top of inner wrap.
		 */
		do_action( 'thewebs_before_content' );
		?>
