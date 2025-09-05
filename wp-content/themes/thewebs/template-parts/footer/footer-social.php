<?php
/**
 * Template part for displaying the Footer Social Module
 *
 * @package thewebs
 */

namespace Thewebs;

$align        = ( thewebs()->sub_option( 'footer_social_align', 'desktop' ) ? thewebs()->sub_option( 'footer_social_align', 'desktop' ) : 'default' );
$tablet_align = ( thewebs()->sub_option( 'footer_social_align', 'tablet' ) ? thewebs()->sub_option( 'footer_social_align', 'tablet' ) : 'default' );
$mobile_align = ( thewebs()->sub_option( 'footer_social_align', 'mobile' ) ? thewebs()->sub_option( 'footer_social_align', 'mobile' ) : 'default' );

$valign        = ( thewebs()->sub_option( 'footer_social_vertical_align', 'desktop' ) ? thewebs()->sub_option( 'footer_social_vertical_align', 'desktop' ) : 'default' );
$tablet_valign = ( thewebs()->sub_option( 'footer_social_vertical_align', 'tablet' ) ? thewebs()->sub_option( 'footer_social_vertical_align', 'tablet' ) : 'default' );
$mobile_valign = ( thewebs()->sub_option( 'footer_social_vertical_align', 'mobile' ) ? thewebs()->sub_option( 'footer_social_vertical_align', 'mobile' ) : 'default' );
if ( ! wp_style_is( 'thewebs-header', 'enqueued' ) ) {
	wp_enqueue_style( 'thewebs-header' );
}
?>
<div class="footer-widget-area widget-area site-footer-focus-item footer-social content-align-<?php echo esc_attr( $align ); ?> content-tablet-align-<?php echo esc_attr( $tablet_align ); ?> content-mobile-align-<?php echo esc_attr( $mobile_align ); ?> content-valign-<?php echo esc_attr( $valign ); ?> content-tablet-valign-<?php echo esc_attr( $tablet_valign ); ?> content-mobile-valign-<?php echo esc_attr( $mobile_valign ); ?>" data-section="thewebs_customizer_footer_social">
	<div class="footer-widget-area-inner footer-social-inner">
		<?php
		/**
		 * Thewebs Footer Social
		 *
		 * Hooked Thewebs\footer_social
		 */
		do_action( 'thewebs_footer_social' );
		?>
	</div>
</div><!-- data-section="footer_social" -->
