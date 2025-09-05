<?php
/**
 * Template part for displaying a pagination
 *
 * @package thewebs
 */

namespace Thewebs;

the_posts_pagination(
	apply_filters(
		'thewebs_pagination_args',
		array(
			'mid_size'           => 2,
			'prev_text'          => '<span class="screen-reader-text">' . __( 'Previous Page', 'thewebs' ) . '</span>' . thewebs()->get_icon( 'arrow-left', _x( 'Previous', 'previous set of archive results', 'thewebs' ) ),
			'next_text'          => '<span class="screen-reader-text">' . __( 'Next Page', 'thewebs' ) . '</span>' . thewebs()->get_icon( 'arrow-right', _x( 'Next', 'next set of archive results', 'thewebs' ) ),
			'screen_reader_text' => __( 'Page navigation', 'thewebs' ),
		)
	)
);
