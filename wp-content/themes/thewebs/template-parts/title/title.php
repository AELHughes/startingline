<?php
/**
 * Template part for displaying a post's title
 *
 * @package thewebs
 */

namespace Thewebs;

do_action( 'thewebs_single_before_entry_title' );
the_title( '<h1 class="entry-title">', '</h1>' );
do_action( 'thewebs_single_after_entry_title' );
