<?php
/**
 * Template part for displaying a post's header
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<header class="entry-header">

	<?php
	/**
	 * Hook for entry header.
	 *
	 * @hooked Thewebs\loop_entry_taxonomies - 10
	 * @hooked Thewebs\loop_entry_title - 20
	 * @hooked Thewebs\loop_entry_meta - 30
	 */
	do_action( 'thewebs_loop_entry_header' );
	?>
</header><!-- .entry-header -->
