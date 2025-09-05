<?php
/**
 * Thewebs\Scripts\Component class
 *
 * @package thewebs
 */

namespace Thewebs\Scripts;

use Thewebs\Component_Interface;
use function Thewebs\thewebs;
use WP_Post;
use function add_action;
use function add_filter;
use function wp_enqueue_script;
use function get_theme_file_uri;
use function get_theme_file_path;
use function wp_script_add_data;
use function wp_localize_script;

/**
 * Class for adding scripts to the front end.
 */
class Component implements Component_Interface {

	/**
	 * Gets the unique identifier for the theme component.
	 *
	 * @return string Component slug.
	 */
	public function get_slug() : string {
		return 'scripts';
	}

	/**
	 * Adds the action and filter hooks to integrate with WordPress.
	 */
	public function initialize() {
		add_action( 'wp_enqueue_scripts', array( $this, 'action_enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'ie_11_support_scripts' ), 60 );
	}
	/**
	 * Add some very basic support for IE11
	 */
	public function ie_11_support_scripts() {
		if ( apply_filters( 'thewebs_add_ie11_support', false ) || thewebs()->option( 'ie11_basic_support' ) ) {
			wp_enqueue_style( 'thewebs-ie11', get_theme_file_uri( '/assets/css/ie.min.css' ), array(), THEWEBS_VERSION );
			wp_enqueue_script(
				'thewebs-css-vars-poly',
				get_theme_file_uri( '/assets/js/css-vars-ponyfill.min.js' ),
				array(),
				THEWEBS_VERSION,
				true
			);
			wp_script_add_data( 'thewebs-css-vars-poly', 'async', true );
			wp_script_add_data( 'thewebs-css-vars-poly', 'precache', true );
			wp_enqueue_script(
				'thewebs-ie11',
				get_theme_file_uri( '/assets/js/ie.min.js' ),
				array(),
				THEWEBS_VERSION,
				true
			);
			wp_script_add_data( 'thewebs-ie11', 'async', true );
			wp_script_add_data( 'thewebs-ie11', 'precache', true );
		}
	}
	/**
	 * Enqueues a script that improves navigation menu accessibility as well as sticky header etc.
	 */
	public function action_enqueue_scripts() {

		// If the AMP plugin is active, return early.
		if ( thewebs()->is_amp() ) {
			return;
		}

		$breakpoint = 1024;
		if ( thewebs()->sub_option( 'header_mobile_switch', 'size' ) ) {
			$breakpoint = thewebs()->sub_option( 'header_mobile_switch', 'size' );
		}
		// Enqueue the slide script.
		wp_register_script(
			'kad-splide',
			get_theme_file_uri( '/assets/js/splide.min.js' ),
			array(),
			THEWEBS_VERSION,
			true
		);
		wp_script_add_data( 'kad-splide', 'async', true );
		wp_script_add_data( 'kad-splide', 'precache', true );
		// Enqueue the slide script.
		wp_register_script(
			'thewebs-slide-init',
			get_theme_file_uri( '/assets/js/splide-init.min.js' ),
			array( 'kad-splide', 'thewebs-navigation' ),
			THEWEBS_VERSION,
			true
		);
		wp_script_add_data( 'thewebs-slide-init', 'async', true );
		wp_script_add_data( 'thewebs-slide-init', 'precache', true );
		wp_localize_script(
			'thewebs-slide-init',
			'thewebsSlideConfig',
			array(
				'of'    => __( 'of', 'thewebs' ),
				'to'    => __( 'to', 'thewebs' ),
				'slide' => __( 'Slide', 'thewebs' ),
				'next'  => __( 'Next', 'thewebs' ),
				'prev'  => __( 'Previous', 'thewebs' ),
			)
		);
		if ( thewebs()->option( 'lightbox' ) ) {
			// Enqueue the lightbox script.
			wp_enqueue_script(
				'thewebs-simplelightbox',
				get_theme_file_uri( '/assets/js/simplelightbox.min.js' ),
				array(),
				THEWEBS_VERSION,
				true
			);
			wp_script_add_data( 'thewebs-simplelightbox', 'async', true );
			wp_script_add_data( 'thewebs-simplelightbox', 'precache', true );
			// Enqueue the slide script.
			wp_enqueue_script(
				'thewebs-lightbox-init',
				get_theme_file_uri( '/assets/js/lightbox-init.min.js' ),
				array( 'thewebs-simplelightbox' ),
				THEWEBS_VERSION,
				true
			);
			wp_script_add_data( 'thewebs-lightbox-init', 'async', true );
			wp_script_add_data( 'thewebs-lightbox-init', 'precache', true );
		}
		// Main js file.
		$file = 'navigation.min.js';
		// Lets make it possile to load a lighter file if things are not being used.
		if ( 'no' === thewebs()->option( 'header_sticky' ) && 'no' === thewebs()->option( 'mobile_header_sticky' ) && ! thewebs()->option( 'enable_scroll_to_id' ) && ! thewebs()->option( 'scroll_up' ) ) {
			$file = 'navigation-lite.min.js';
		}
		wp_enqueue_script(
			'thewebs-navigation',
			get_theme_file_uri( '/assets/js/' . $file ),
			array(),
			THEWEBS_VERSION,
			true
		);
		wp_script_add_data( 'thewebs-navigation', 'async', true );
		wp_script_add_data( 'thewebs-navigation', 'precache', true );
		wp_localize_script(
			'thewebs-navigation',
			'thewebsConfig',
			array(
				'screenReader' => array(
					'expand'     => __( 'Expand child menu', 'thewebs' ),
					'expandOf'   => __( 'Expand child menu of', 'thewebs' ),
					'collapse'   => __( 'Collapse child menu', 'thewebs' ),
					'collapseOf' => __( 'Collapse child menu of', 'thewebs' ),
				),
				'breakPoints' => array(
					'desktop' => esc_attr( $breakpoint ),
					'tablet' => 768,
				),
				'scrollOffset' => apply_filters( 'thewebs_scroll_to_id_additional_offset', 0 ),
			)
		);
	}
}
