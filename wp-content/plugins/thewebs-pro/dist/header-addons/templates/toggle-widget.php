<?php
/**
 * Template part for displaying the header toggle widget
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

?>
<div class="site-header-item site-header-focus-item" data-section="thewebs_customizer_header_toggle_widget">
	<?php
	/**
	 * Thewebs Header Toggle Widget
	 *
	 * Hooked Thewebs_Pro\header_toggle_widget
	 */
	do_action( 'thewebs_header_toggle_widget' );
	?>
</div><!-- data-section="header_toggle_widget" -->
