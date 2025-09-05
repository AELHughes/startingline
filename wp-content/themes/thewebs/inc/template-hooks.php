<?php
/**
 * Calls in content using theme hooks.
 *
 * @package thewebs
 */

namespace Thewebs;

use function Thewebs\thewebs;
use function add_action;

defined( 'ABSPATH' ) || exit;

/**
 * Thewebs Header.
 *
 * @see Thewebs\header_markup();
 */
add_action( 'thewebs_header', 'Thewebs\header_markup' );

/**
 * Thewebs Header Rows
 *
 * @see Thewebs\top_header();
 * @see Thewebs\main_header();
 * @see Thewebs\bottom_header();
 */
add_action( 'thewebs_top_header', 'Thewebs\top_header' );
add_action( 'thewebs_main_header', 'Thewebs\main_header' );
add_action( 'thewebs_bottom_header', 'Thewebs\bottom_header' );

/**
 * Thewebs Header Columns
 *
 * @see Thewebs\header_column();
 */
add_action( 'thewebs_render_header_column', 'Thewebs\header_column', 10, 2 );

/**
 * Thewebs Mobile Header
 *
 * @see Thewebs\mobile_header();
 */
add_action( 'thewebs_mobile_header', 'Thewebs\mobile_header' );

/**
 * Thewebs Mobile Header Rows
 *
 * @see Thewebs\mobile_top_header();
 * @see Thewebs\mobile_main_header();
 * @see Thewebs\mobile_bottom_header();
 */
add_action( 'thewebs_mobile_top_header', 'Thewebs\mobile_top_header' );
add_action( 'thewebs_mobile_main_header', 'Thewebs\mobile_main_header' );
add_action( 'thewebs_mobile_bottom_header', 'Thewebs\mobile_bottom_header' );

/**
 * Thewebs Mobile Header Columns
 *
 * @see Thewebs\mobile_header_column();
 */
add_action( 'thewebs_render_mobile_header_column', 'Thewebs\mobile_header_column', 10, 2 );

/**
 * Desktop Header Elements.
 *
 * @see Thewebs\site_branding();
 * @see Thewebs\primary_navigation();
 * @see Thewebs\secondary_navigation();
 * @see Thewebs\header_html();
 * @see Thewebs\header_button();
 * @see Thewebs\header_cart();
 * @see Thewebs\header_social();
 * @see Thewebs\header_search();
 */
add_action( 'thewebs_site_branding', 'Thewebs\site_branding' );
add_action( 'thewebs_primary_navigation', 'Thewebs\primary_navigation' );
add_action( 'thewebs_secondary_navigation', 'Thewebs\secondary_navigation' );
add_action( 'thewebs_header_html', 'Thewebs\header_html' );
add_action( 'thewebs_header_button', 'Thewebs\header_button' );
add_action( 'thewebs_header_cart', 'Thewebs\header_cart' );
add_action( 'thewebs_header_social', 'Thewebs\header_social' );
add_action( 'thewebs_header_search', 'Thewebs\header_search' );
/**
 * Mobile Header Elements.
 *
 * @see Thewebs\mobile_site_branding();
 * @see Thewebs\navigation_popup_toggle();
 * @see Thewebs\mobile_navigation();
 * @see Thewebs\mobile_html();
 * @see Thewebs\mobile_button();
 * @see Thewebs\mobile_cart();
 * @see Thewebs\mobile_social();
 * @see Thewebs\primary_navigation();
 */
add_action( 'thewebs_mobile_site_branding', 'Thewebs\mobile_site_branding' );
add_action( 'thewebs_navigation_popup_toggle', 'Thewebs\navigation_popup_toggle' );
add_action( 'thewebs_mobile_navigation', 'Thewebs\mobile_navigation' );
add_action( 'thewebs_mobile_html', 'Thewebs\mobile_html' );
add_action( 'thewebs_mobile_button', 'Thewebs\mobile_button' );
add_action( 'thewebs_mobile_cart', 'Thewebs\mobile_cart' );
add_action( 'thewebs_mobile_social', 'Thewebs\mobile_social' );

/**
 * Hero Title
 *
 * @see Thewebs\hero_title();
 */
add_action( 'thewebs_hero_header', 'Thewebs\hero_title' );

/**
 * Page Title area
 *
 * @see Thewebs\thewebs_entry_header();
 */
add_action( 'thewebs_entry_hero', 'Thewebs\thewebs_entry_header', 10, 2 );
add_action( 'thewebs_entry_header', 'Thewebs\thewebs_entry_header', 10, 2 );

/**
 * Archive Title area
 *
 * @see Thewebs\thewebs_entry_archive_header();
 */
add_action( 'thewebs_entry_archive_hero', 'Thewebs\thewebs_entry_archive_header', 10, 2 );
add_action( 'thewebs_entry_archive_header', 'Thewebs\thewebs_entry_archive_header', 10, 2 );

/**
 * Singular Content
 *
 * @see Thewebs\single_markup();
 */
add_action( 'thewebs_single', 'Thewebs\single_markup' );

/**
 * Singular Inner Content
 *
 * @see Thewebs\single_content();
 */
add_action( 'thewebs_single_content', 'Thewebs\single_content' );

/**
 * 404 Content
 *
 * @see Thewebs\get_404_content();
 */
add_action( 'thewebs_404_content', 'Thewebs\get_404_content' );

/**
 * Comments List
 *
 * @see Thewebs\comments_list();
 */
add_action( 'thewebs_comments', 'Thewebs\comments_list' );

/**
 * Comment Form
 *
 * @see Thewebs\comments_form();
 */
function check_comments_form_order() {
	$priority = ( thewebs()->option( 'comment_form_before_list' ) ? 5 : 15 );
	add_action( 'thewebs_comments', 'Thewebs\comments_form', $priority );
}
add_action( 'thewebs_comments', 'Thewebs\check_comments_form_order', 1 );
/**
 * Archive Content
 *
 * @see Thewebs\archive_markup();
 */
add_action( 'thewebs_archive', 'Thewebs\archive_markup' );

/**
 * Archive Entry Content.
 *
 * @see Thewebs\loop_entry();
 */
add_action( 'thewebs_loop_entry', 'Thewebs\loop_entry' );

/**
 * Archive Entry thumbnail.
 *
 * @see Thewebs\loop_entry_thumbnail();
 */
add_action( 'thewebs_loop_entry_thumbnail', 'Thewebs\loop_entry_thumbnail' );

/**
 * Archive Entry header.
 *
 * @see Thewebs\loop_entry_header();
 */
add_action( 'thewebs_loop_entry_content', 'Thewebs\loop_entry_header', 10 );
/**
 * Archive Entry Summary.
 *
 * @see Thewebs\loop_entry_summary();
 */
add_action( 'thewebs_loop_entry_content', 'Thewebs\loop_entry_summary', 20 );
/**
 * Archive Entry Footer.
 *
 * @see Thewebs\loop_entry_footer();
 */
add_action( 'thewebs_loop_entry_content', 'Thewebs\loop_entry_footer', 30 );

/**
 * Archive Entry Taxonomies.
 *
 * @see Thewebs\loop_entry_taxonomies();
 */
add_action( 'thewebs_loop_entry_header', 'Thewebs\loop_entry_taxonomies', 10 );
/**
 * Archive Entry Title.
 *
 * @see Thewebs\loop_entry_title();
 */
add_action( 'thewebs_loop_entry_header', 'Thewebs\loop_entry_title', 20 );
/**
 * Archive Entry Meta.
 *
 * @see Thewebs\loop_entry_meta();
 */
add_action( 'thewebs_loop_entry_header', 'Thewebs\loop_entry_meta', 30 );

/**
 * Main Call for Thewebs footer
 *
 * @see Thewebs\footer_markup();
 */
add_action( 'thewebs_footer', 'Thewebs\footer_markup' );

/**
 * Footer Top Row
 *
 * @see Thewebs\top_footer();
 */
add_action( 'thewebs_top_footer', 'Thewebs\top_footer' );

/**
 * Footer Middle Row
 *
 * @see Thewebs\middle_footer()
 */
add_action( 'thewebs_middle_footer', 'Thewebs\middle_footer' );

/**
 * Footer Bottom Row
 *
 * @see Thewebs\bottom_footer()
 */
add_action( 'thewebs_bottom_footer', 'Thewebs\bottom_footer' );

/**
 * Footer Column
 *
 * @see Thewebs\footer_column()
 */
add_action( 'thewebs_render_footer_column', 'Thewebs\footer_column', 10, 2 );


/**
 * Footer Elements
 *
 * @see Thewebs\footer_html();
 * @see Thewebs\footer_navigation()
 * @see Thewebs\footer_social()
 */
add_action( 'thewebs_footer_html', 'Thewebs\footer_html' );
add_action( 'thewebs_footer_navigation', 'Thewebs\footer_navigation' );
add_action( 'thewebs_footer_social', 'Thewebs\footer_social' );

/**
 * WP Footer.
 *
 * @see Thewebs\scroll_up();
 */
add_action( 'wp_footer', 'Thewebs\scroll_up' );
