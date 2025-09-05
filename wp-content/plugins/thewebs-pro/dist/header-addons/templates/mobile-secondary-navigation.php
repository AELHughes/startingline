<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-mobile-navigation mobile-secondary-navigation-layout-stretch-<?php echo ( thewebs()->option( 'mobile_secondary_navigation_stretch' ) ? 'true' : 'false' ); ?>" data-section="thewebs_customizer_mobile_secondary_navigation">
	<?php
	/**
	 * Thewebs Mobile Secondary Navigation
	 *
	 * Hooked Thewebs\mobile_secondary_navigation
	 */
	do_action( 'thewebs_mobile_secondary_navigation' );
	?>
</div><!-- data-section="mobile_secondary_navigation" -->
