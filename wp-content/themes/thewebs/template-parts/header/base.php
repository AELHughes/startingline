<?php
/**
 * Template part for displaying the header
 *
 * @package thewebs
 */

namespace Thewebs;

thewebs()->print_styles( 'thewebs-header' );
?>
<header id="masthead" class="site-header" role="banner" <?php thewebs()->print_microdata( 'header' ); ?>>
	<div id="main-header" class="site-header-wrap">
		<div class="site-header-inner-wrap<?php echo esc_attr( 'top_main_bottom' === thewebs()->option( 'header_sticky' ) ? ' thewebs-sticky-header' : '' ); ?>"<?php
		if ( 'top_main_bottom' === thewebs()->option( 'header_sticky' ) ) {
			echo ' data-reveal-scroll-up="' . ( thewebs()->option( 'header_reveal_scroll_up' ) ? 'true' : 'false' ) . '"';
			echo ' data-shrink="' . ( thewebs()->option( 'header_sticky_shrink' ) ? 'true' : 'false' ) . '"';
			if ( thewebs()->option( 'header_sticky_shrink' ) ) {
				echo ' data-shrink-height="' . esc_attr( thewebs()->sub_option( 'header_sticky_main_shrink', 'size' ) ) . '"';
			}
		}
		?>>
			<div class="site-header-upper-wrap">
				<div class="site-header-upper-inner-wrap<?php echo esc_attr( 'top_main' === thewebs()->option( 'header_sticky' ) ? ' thewebs-sticky-header' : '' ); ?>"<?php
				if ( 'top_main' === thewebs()->option( 'header_sticky' ) ) {
					echo ' data-reveal-scroll-up="' . ( thewebs()->option( 'header_reveal_scroll_up' ) ? 'true' : 'false' ) . '"';
					echo ' data-shrink="' . ( thewebs()->option( 'header_sticky_shrink' ) ? 'true' : 'false' ) . '"';
					if ( thewebs()->option( 'header_sticky_shrink' ) ) {
						echo ' data-shrink-height="' . esc_attr( thewebs()->sub_option( 'header_sticky_main_shrink', 'size' ) ) . '"';
					}
				}
				?>>
					<?php
					/**
					 * Thewebs Top Header
					 *
					 * Hooked Thewebs\top_header
					 */
					do_action( 'thewebs_top_header' );
					/**
					 * Thewebs Main Header
					 *
					 * Hooked Thewebs\main_header
					 */
					do_action( 'thewebs_main_header' );
					?>
				</div>
			</div>
			<?php
			/**
			 * Thewebs Bottom Header
			 *
			 * Hooked Thewebs\bottom_header
			 */
			do_action( 'thewebs_bottom_header' );
			?>
		</div>
	</div>
	<?php
	/**
	 * Thewebs Mobile Header
	 *
	 * Hooked Thewebs\mobile_header
	 */
	do_action( 'thewebs_mobile_header' );
	?>
</header><!-- #masthead -->
