<?php
/**
 * Template part for displaying a post
 *
 * @package thewebs
 */

namespace Thewebs;

?>

<article <?php post_class( 'entry content-bg loop-entry' ); ?>>
	<?php
		/**
		 * Hook for entry thumbnail.
		 *
		 * @hooked Thewebs\loop_entry_thumbnail
		 */
		do_action( 'thewebs_loop_entry_thumbnail' );
	?>
	<div class="entry-content-wrap">
		<?php
		/**
		 * Hook for entry content.
		 *
		 * @hooked Thewebs\loop_entry_header - 10
		 * @hooked Thewebs\loop_entry_summary - 20
		 * @hooked Thewebs\loop_entry_footer - 30
		 */
		do_action( 'thewebs_loop_entry_content' );
		?>
	</div>
</article>
