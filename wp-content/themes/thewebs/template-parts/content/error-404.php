<?php
/**
 * Template part for displaying the page content when a 404 error has occurred
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<section class="error">

	<div class="page-content entry content-bg">

		<div class="entry-content-wrap">

			<?php
			do_action( 'thewebs_404_before_inner_content' );

			get_template_part( 'template-parts/content/page_header' ); ?>
			<p>
				<?php esc_html_e( 'It looks like nothing was found at this location. Maybe try a search?', 'thewebs' ); ?>
			</p>

			<?php
			get_search_form();

			do_action( 'thewebs_404_after_inner_content' );
			?>
		</div>
	</div><!-- .page-content -->
</section><!-- .error -->
