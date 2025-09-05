<?php
/**
 * Template part for displaying the header branding/logo
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<div class="site-header-item site-header-focus-item" data-section="title_tagline">
	<?php
	/**
	 * Thewebs Site Branding
	 *
	 * Hooked Thewebs\site_branding
	 */
	do_action( 'thewebs_site_branding' );
	?>
</div><!-- data-section="title_tagline" -->
