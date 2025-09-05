<?php
/**
 * Template part for displaying the header navigation menu
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item site-header-item-navgation-popup-toggle" data-section="thewebs_customizer_mobile_trigger">
	<?php
	/**
	 * Thewebs Mobile Navigation Popup Toggle
	 *
	 * Hooked Thewebs\navigation_popup_toggle
	 */
	do_action( 'thewebs_navigation_popup_toggle' );
	?>
</div><!-- data-section="mobile_trigger" -->
