<?php
/**
 * Template part for displaying the a button in the mobile header.
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item" data-section="thewebs_customizer_mobile_button">
	<?php
	/**
	 * Thewebs Mobile Header Button
	 *
	 * Hooked Thewebs\mobile_button
	 */
	do_action( 'thewebs_mobile_button' );
	?>
</div><!-- data-section="mobile_button" -->
