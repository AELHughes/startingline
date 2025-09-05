<?php
/**
 * The main single item template file.
 *
 * @package thewebs
 */

namespace Thewebs;

/**
* Hook for Hero Section
*/
do_action( 'thewebs_hero_header' );
?>
<div id="primary" class="content-area">
	<div class="content-container site-container">
		<main id="main" class="site-main" role="main">
			<?php
			/**
			 * Hook for anything before main content
			 */
			do_action( 'thewebs_before_main_content' );
			?>
			<div class="content-wrap">
				<?php
				if ( is_404() ) {
					do_action( 'thewebs_404_content' );
				} elseif ( have_posts() ) {
					while ( have_posts() ) {
						the_post();
						/**
						 * Hook in content single entry template.
						 */
						do_action( 'thewebs_single_content' );
					}
				} else {
					get_template_part( 'template-parts/content/error' );
				}
				?>
			</div>
			<?php			
			/**
			 * Hook for anything after main content
			 */
			do_action( 'thewebs_after_main_content' );
			?>
		</main><!-- #main -->
		<?php
		get_sidebar();
		?>
	</div>
</div><!-- #primary -->
