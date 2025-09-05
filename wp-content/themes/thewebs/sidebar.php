<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package thewebs
 */

namespace Thewebs;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! thewebs()->has_sidebar() ) {
	return;
}
thewebs()->print_styles( 'thewebs-sidebar' );

?>
<aside id="secondary" role="complementary" class="primary-sidebar widget-area <?php echo esc_attr( thewebs()->sidebar_id_class() ); ?> sidebar-link-style-<?php echo esc_attr( thewebs()->option( 'sidebar_link_style' ) ); ?>">
	<div class="sidebar-inner-wrap">
		<?php
		/**
		 * Hook for before sidebar.
		 */
		do_action( 'thewebs_before_sidebar' );

		thewebs()->display_sidebar();
		/**
		 * Hook for after sidebar.
		 */
		do_action( 'thewebs_after_sidebar' );
		?>
	</div>
</aside><!-- #secondary -->
