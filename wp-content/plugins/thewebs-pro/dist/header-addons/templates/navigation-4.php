<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-main-navigation header-navigation-layout-stretch-<?php echo ( thewebs()->option( 'quaternary_navigation_stretch' ) ? 'true' : 'false' ); ?> header-navigation-layout-fill-stretch-<?php echo ( thewebs()->option( 'quaternary_navigation_fill_stretch' ) ? 'true' : 'false' ); ?>" data-section="thewebs_customizer_quaternary_navigation">
	<?php
	/**
	 * Thewebs quaternary Navigation
	 *
	 * Hooked Thewebs_Pro\quaternary_navigation
	 */
	do_action( 'thewebs_quaternary_navigation' );
	?>
</div><!-- data-section="quaternary_navigation" -->
