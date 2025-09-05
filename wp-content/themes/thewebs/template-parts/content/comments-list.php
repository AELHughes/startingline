<?php
/**
 * Template part for displaying comments list.
 *
 * @package thewebs
 */

namespace Thewebs;

?>
<?php
if ( have_comments() ) {
	do_action( 'thewebs_before_comments_list' );

	$title_output = '<h2 class="comments-title">';
	$comment_count = (int) get_comments_number();
	if ( 1 === $comment_count ) {
		$title_output .= esc_html__( 'One Comment', 'thewebs' );
	} else {
		$title_output .= sprintf(
			/* translators: 1: comment count number */
			esc_html( _nx( '%1$s Comment', '%1$s Comments', $comment_count, 'comments title', 'thewebs' ) ),
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			number_format_i18n( $comment_count )
		);
	}
	$title_output .= '</h2><!-- .comments-title -->';
	echo wp_kses_post( apply_filters( 'thewebs_single_post_comments_title', $title_output ) );

	the_comments_navigation();

	thewebs()->the_comments();

	if ( ! comments_open() ) {
		?>
		<p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'thewebs' ); ?></p>
		<?php
	}
	do_action( 'thewebs_after_comments_list' );
}
