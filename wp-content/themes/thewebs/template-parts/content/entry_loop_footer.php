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
	get_template_part( 'template-parts/content/entry_actions', get_post_type() );
	?>
</footer><!-- .entry-footer -->
