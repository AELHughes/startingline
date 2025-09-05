<?php
/**
 * Template part for displaying the footer info
 *
 * @package thewebs
 */

namespace Thewebs;

if ( thewebs()->has_content() ) {
	thewebs()->print_styles( 'thewebs-content' );
}
thewebs()->print_styles( 'thewebs-footer' );

?>
<footer id="colophon" class="site-footer" role="contentinfo">
	<div class="site-footer-wrap">
		<?php
		/**
		 * Thewebs Top footer
		 *
		 * Hooked Thewebs\top_footer
		 */
		do_action( 'thewebs_top_footer' );
		/**
		 * Thewebs Middle footer
		 *
		 * Hooked Thewebs\middle_footer
		 */
		do_action( 'thewebs_middle_footer' );
		/**
		 * Thewebs Bottom footer
		 *
		 * Hooked Thewebs\bottom_footer
		 */
		do_action( 'thewebs_bottom_footer' );
		?>
	</div>
</footer><!-- #colophon -->

