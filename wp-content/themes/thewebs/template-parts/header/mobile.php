<?php
/**
 * Template part for displaying the Mobile Header
 *
 * @package thewebs
 */

namespace Thewebs;

?>

<div id="mobile-header" class="site-mobile-header-wrap">
	<div class="site-header-inner-wrap<?php echo esc_attr( 'top_main_bottom' === thewebs()->option( 'mobile_header_sticky' ) ? ' thewebs-sticky-header' : '' ); ?>"<?php
	if ( 'top_main_bottom' === thewebs()->option( 'mobile_header_sticky' ) ) {
		echo ' data-shrink="' . ( thewebs()->option( 'mobile_header_sticky_shrink' ) ? 'true' : 'false' ) . '"';
		echo ' data-reveal-scroll-up="' . ( thewebs()->option( 'mobile_header_reveal_scroll_up' ) ? 'true' : 'false' ) . '"';
		if ( thewebs()->option( 'mobile_header_sticky_shrink' ) ) {
			echo ' data-shrink-height="' . esc_attr( thewebs()->sub_option( 'mobile_header_sticky_main_shrink', 'size' ) ) . '"';
		}
	}
	?>>
		<div class="site-header-upper-wrap">
			<div class="site-header-upper-inner-wrap<?php echo esc_attr( 'top_main' === thewebs()->option( 'mobile_header_sticky' ) ? ' thewebs-sticky-header' : '' ); ?>"<?php
			if ( 'top_main' === thewebs()->option( 'mobile_header_sticky' ) ) {
				echo ' data-shrink="' . ( thewebs()->option( 'mobile_header_sticky_shrink' ) ? 'true' : 'false' ) . '"';
				echo ' data-reveal-scroll-up="' . ( thewebs()->option( 'mobile_header_reveal_scroll_up' ) ? 'true' : 'false' ) . '"';
				if ( thewebs()->option( 'mobile_header_sticky_shrink' ) ) {
					echo ' data-shrink-height="' . esc_attr( thewebs()->sub_option( 'mobile_header_sticky_main_shrink', 'size' ) ) . '"';
				}
			}
			?>>
			<?php
			/**
			 * Thewebs Top Header
			 *
			 * Hooked thewebs_mobile_top_header 10
			 */
			do_action( 'thewebs_mobile_top_header' );
			/**
			 * Thewebs Main Header
			 *
			 * Hooked thewebs_mobile_main_header 10
			 */
			do_action( 'thewebs_mobile_main_header' );
			?>
			</div>
		</div>
		<?php
		/**
		 * Thewebs Mobile Bottom Header
		 *
		 * Hooked thewebs_mobile_bottom_header 10
		 */
		do_action( 'thewebs_mobile_bottom_header' );
		?>
	</div>
</div>
