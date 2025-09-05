<?php
/**
 * Template part for displaying a post's header
 *
 * @package thewebs
 */

namespace Thewebs;

$classes   = array();
$classes[] = 'entry-header';
if ( is_singular( get_post_type() ) ) {
	$classes[] = get_post_type() . '-title';
	$classes[] = 'title-align-' . ( thewebs()->sub_option( get_post_type() . '_title_align', 'desktop' ) ? thewebs()->sub_option( get_post_type() . '_title_align', 'desktop' ) : 'inherit' );
	$classes[] = 'title-tablet-align-' . ( thewebs()->sub_option( get_post_type() . '_title_align', 'tablet' ) ? thewebs()->sub_option( get_post_type() . '_title_align', 'tablet' ) : 'inherit' );
	$classes[] = 'title-mobile-align-' . ( thewebs()->sub_option( get_post_type() . '_title_align', 'mobile' ) ? thewebs()->sub_option( get_post_type() . '_title_align', 'mobile' ) : 'inherit' );
}
?>
<header class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>">
	<?php
	do_action( 'thewebs_single_before_entry_header' );
	/**
	 * Thewebs Entry Header
	 *
	 * Hooked thewebs_entry_header 10
	 */
	do_action( 'thewebs_entry_header', get_post_type(), 'normal' );
	
	do_action( 'thewebs_single_after_entry_header' );
	?>
</header><!-- .entry-header -->
