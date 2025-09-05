<?php
/**
 * Template part for displaying a post's footer
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<footer class="entry-footer">
	<?php
	if ( 'post' === get_post_type() && thewebs()->option( 'post_tags' ) ) {
		get_template_part( 'template-parts/content/entry_tags', get_post_type() );
	}
	?>
</footer><!-- .entry-footer -->
