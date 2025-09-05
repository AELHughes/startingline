<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-mobile-navigation mobile-navigation-layout-stretch-<?php echo ( thewebs()->option( 'mobile_navigation_stretch' ) ? 'true' : 'false' ); ?>" data-section="thewebs_customizer_mobile_navigation">
	<?php
	/**
	 * Thewebs Mobile Navigation
	 *
	 * Hooked Thewebs\mobile_navigation
	 */
	do_action( 'thewebs_mobile_navigation' );
	?>
</div><!-- data-section="mobile_navigation" -->
