<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-main-navigation header-navigation-layout-stretch-<?php echo ( thewebs()->option( 'secondary_navigation_stretch' ) ? 'true' : 'false' ); ?> header-navigation-layout-fill-stretch-<?php echo ( thewebs()->option( 'secondary_navigation_fill_stretch' ) ? 'true' : 'false' ); ?>" data-section="thewebs_customizer_secondary_navigation">
	<?php
	/**
	 * Thewebs Secondary Navigation
	 *
	 * Hooked Thewebs\secondary_navigation
	 */
	do_action( 'thewebs_secondary_navigation' );
	?>
</div><!-- data-section="secondary_navigation" -->
