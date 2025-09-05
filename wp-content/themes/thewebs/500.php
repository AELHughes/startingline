<?php
/**
 * The template for displaying 500 pages (internal server errors)
 *
 * @link https://github.com/xwp/pwa-wp#offline--500-error-handling
 *
 * @package thewebs
 */

namespace Thewebs;

get_header();

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

thewebs()->print_styles( 'thewebs-content' );
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

			get_template_part( 'template-parts/content/error', '500' );
			/**
			 * Hook for anything after main content.
			 */
			do_action( 'thewebs_after_main_content' );
			?>
		</main><!-- #main -->
		<?php
		get_sidebar();
		?>
	</div>
</div><!-- #primary -->
<?php
get_footer();
