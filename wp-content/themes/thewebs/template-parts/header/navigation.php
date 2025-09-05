<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-main-navigation header-navigation-layout-stretch-<?php echo ( thewebs()->option( 'primary_navigation_stretch' ) ? 'true' : 'false' ); ?> header-navigation-layout-fill-stretch-<?php echo ( thewebs()->option( 'primary_navigation_fill_stretch' ) ? 'true' : 'false' ); ?>" data-section="thewebs_customizer_primary_navigation">
	<?php
	/**
	 * Thewebs Primary Navigation
	 *
	 * Hooked Thewebs\primary_navigation
	 */
	do_action( 'thewebs_primary_navigation' );
	?>
</div><!-- data-section="primary_navigation" -->
