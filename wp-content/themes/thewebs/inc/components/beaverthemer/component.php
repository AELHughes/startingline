<?php
/**
 * Thewebs\BeaverThemer\Component class
 *
 * @package thewebs
 */

namespace Thewebs\BeaverThemer;

use Thewebs\Component_Interface;
use function Thewebs\thewebs;
use function add_action;
use function add_theme_support;
use function have_posts;
use function the_post;
use function is_search;
use function get_template_part;
use function get_post_type;
use FLThemeBuilderLayoutData;

/**
 * Class for adding Woocommerce plugin support.
 */
class Component implements Component_Interface {

	/**
	 * Gets the unique identifier for the theme component.
	 *
	 * @return string Component slug.
	 */
	public function get_slug() : string {
		return 'beaverthemer';
	}

	/**
	 * Adds the action and filter hooks to integrate with WordPress.
	 */
	public function initialize() {
		add_action( 'after_setup_theme', array( $this, 'action_add_beaver_support' ) );
		add_filter( 'fl_theme_builder_part_hooks', array( $this, 'register_part_hooks' ) );
		add_action( 'wp', array( $this, 'header_footer_render' ) );
	}
	/**
	 * Adds theme support for the Beaver builder plugin.
	 */
	public function action_add_beaver_support() {
		add_theme_support( 'fl-theme-builder-headers' );
		add_theme_support( 'fl-theme-builder-footers' );
		add_theme_support( 'fl-theme-builder-parts' );
	}
	/**
	 * Adds theme support for the Beaver hooks.
	 */
	public function header_footer_render() {
		// Get the header ID.
		$header_ids = FLThemeBuilderLayoutData::get_current_page_header_ids();

		// If we have a header, remove the theme header and hook in Theme Builder's.
		if ( ! empty( $header_ids ) ) {
			remove_action( 'thewebs_header', 'Thewebs\header_markup' );
			add_action( 'thewebs_header', 'FLThemeBuilderLayoutRenderer::render_header' );
		}

		// Get the footer ID.
		$footer_ids = FLThemeBuilderLayoutData::get_current_page_footer_ids();

		// If we have a footer, remove the theme footer and hook in Theme Builder's.
		if ( ! empty( $footer_ids ) ) {
			remove_action( 'thewebs_footer', 'Thewebs\footer_markup' );
			add_action( 'thewebs_footer', 'FLThemeBuilderLayoutRenderer::render_footer' );
		}
	}
	/**
	 * Adds theme support for the Beaver hooks.
	 */
	public function register_part_hooks() {
		return array(
			array(
				'label' => 'Header',
				'hooks' => array(
					'thewebs_before_header' => 'Before Header',
					'thewebs_after_header'  => 'After Header',
				),
			),
			array(
				'label' => 'Content',
				'hooks' => array(
					'thewebs_before_main_content' => 'Before Content',
					'thewebs_after_main_content'  => 'After Content',
				),
			),
			array(
				'label' => 'Footer',
				'hooks' => array(
					'thewebs_before_footer' => 'Before Footer',
					'thewebs_after_footer'  => 'After Footer',
				),
			),
		);
	}
}
