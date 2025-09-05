<?php
/**
 * Template part for displaying the Footer color switch
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;
$align        = ( thewebs()->sub_option( 'footer_dark_mode_align', 'desktop' ) ? thewebs()->sub_option( 'footer_dark_mode_align', 'desktop' ) : 'default' );
$tablet_align = ( thewebs()->sub_option( 'footer_dark_mode_align', 'tablet' ) ? thewebs()->sub_option( 'footer_dark_mode_align', 'tablet' ) : 'default' );
$mobile_align = ( thewebs()->sub_option( 'footer_dark_mode_align', 'mobile' ) ? thewebs()->sub_option( 'footer_dark_mode_align', 'mobile' ) : 'default' );

$valign        = ( thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'desktop' ) ? thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'desktop' ) : 'default' );
$tablet_valign = ( thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'tablet' ) ? thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'tablet' ) : 'default' );
$mobile_valign = ( thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'mobile' ) ? thewebs()->sub_option( 'footer_dark_mode_vertical_align', 'mobile' ) : 'default' );
?>
<div class="footer-widget-area widget-area site-footer-focus-item footer-dark-mode content-align-<?php echo esc_attr( $align ); ?> content-tablet-align-<?php echo esc_attr( $tablet_align ); ?> content-mobile-align-<?php echo esc_attr( $mobile_align ); ?> content-valign-<?php echo esc_attr( $valign ); ?> content-tablet-valign-<?php echo esc_attr( $tablet_valign ); ?> content-mobile-valign-<?php echo esc_attr( $mobile_valign ); ?>" data-section="thewebs_customizer_footer_dark_mode">
	<div class="footer-widget-area-inner footer-dark-mode-inner">
		<?php
		/**
		 * Thewebs Footer Color Switcher
		 *
		 * Hooked Thewebs_Pro\footer_color_switcher
		 */
		do_action( 'thewebs_footer_dark_mode' );
		?>
	</div>
</div><!-- data-section="footer_dark_mode" -->
