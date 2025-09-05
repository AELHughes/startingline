<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package thewebs
 */

namespace Thewebs;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hook for bottom of inner wrap.
 */
do_action( 'thewebs_after_content' );
?>
	</div><!-- #inner-wrap -->
	<?php
	do_action( 'thewebs_before_footer' );
	/**
	 * Thewebs footer hook.
	 *
	 * @hooked Thewebs/footer_markup - 10
	 */
	do_action( 'thewebs_footer' );

	do_action( 'thewebs_after_footer' );
	?>
</div><!-- #wrapper -->
<?php do_action( 'thewebs_after_wrapper' ); ?>

<?php wp_footer(); ?>
</body>
</html>
