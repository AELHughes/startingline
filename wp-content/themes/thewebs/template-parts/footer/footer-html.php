<?php
/**
 * Template part for displaying the footer info
 *
 * @package thewebs
 */

namespace Thewebs;

$align = ( thewebs()->sub_option( 'footer_html_align', 'desktop' ) ? thewebs()->sub_option( 'footer_html_align', 'desktop' ) : 'default' );
$tablet_align = ( thewebs()->sub_option( 'footer_html_align', 'tablet' ) ? thewebs()->sub_option( 'footer_html_align', 'tablet' ) : 'default' );
$mobile_align = ( thewebs()->sub_option( 'footer_html_align', 'mobile' ) ? thewebs()->sub_option( 'footer_html_align', 'mobile' ) : 'default' );

$valign = ( thewebs()->sub_option( 'footer_html_vertical_align', 'desktop' ) ? thewebs()->sub_option( 'footer_html_vertical_align', 'desktop' ) : 'default' );
$tablet_valign = ( thewebs()->sub_option( 'footer_html_vertical_align', 'tablet' ) ? thewebs()->sub_option( 'footer_html_vertical_align', 'tablet' ) : 'default' );
$mobile_valign = ( thewebs()->sub_option( 'footer_html_vertical_align', 'mobile' ) ? thewebs()->sub_option( 'footer_html_vertical_align', 'mobile' ) : 'default' );

?>

<div class="footer-widget-area site-info site-footer-focus-item content-align-<?php echo esc_attr( $align ); ?> content-tablet-align-<?php echo esc_attr( $tablet_align ); ?> content-mobile-align-<?php echo esc_attr( $mobile_align ); ?> content-valign-<?php echo esc_attr( $valign ); ?> content-tablet-valign-<?php echo esc_attr( $tablet_valign ); ?> content-mobile-valign-<?php echo esc_attr( $mobile_valign ); ?>" data-section="thewebs_customizer_footer_html">
	<div class="footer-widget-area-inner site-info-inner">
		<?php
		/**
		 * Thewebs Footer HTML
		 *
		 * Hooked Thewebs\footer_html
		 */
		do_action( 'thewebs_footer_html' );
		?>
	</div>
</div><!-- .site-info -->
