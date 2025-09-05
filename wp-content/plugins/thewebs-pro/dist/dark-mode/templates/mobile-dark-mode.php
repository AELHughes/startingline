<?php
/**
 * Template part for displaying the mobile header color switch
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

?>
<div class="site-header-item site-header-focus-item" data-section="thewebs_customizer_mobile_dark_mode">
	<?php
	/**
	 * Thewebs Mobile Header Color Switcher
	 *
	 * Hooked Thewebs_Pro\mobile_color_switcher
	 */
	do_action( 'thewebs_mobile_dark_mode' );
	?>
</div><!-- data-section="mobile_dark_mode" -->
