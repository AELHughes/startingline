<?php
/**
 * Template part for displaying the header color switch
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

?>
<div class="site-header-item site-header-focus-item" data-section="thewebs_customizer_header_dark_mode">
	<?php
	/**
	 * Thewebs Header Color Switcher
	 *
	 * Hooked Thewebs_Pro\header_color_switcher
	 */
	do_action( 'thewebs_header_dark_mode' );
	?>
</div><!-- data-section="header_dark_mode" -->
