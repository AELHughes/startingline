<?php
/**
 * Main plugin class.
 *
 * @link https://www.fooevents.com
 * @package woocommerce-events
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;}

/**
 * Main plugin class.
 */
class FooEvents_Calendar_Blocks_Calendar {

	/**
	 * Configuration object
	 *
	 * @var array $config contains paths and other configurations
	 */
	private $config;

	/**
	 * On plugin load
	 *
	 * @param array $config the configuration array.
	 */
	public function __construct( $config ) {

		$this->config = $config;

		add_action( 'init', array( $this, 'register_blocks' ) );
	}

	/**
	 * Register FooEvents Blocks
	 */
	public function register_blocks() {

		register_block_type(
			$this->config->path . '/build/fooevents-calendar-shortcode',
			array(
				'render_callback' => array( $this, 'output_calendar' ),
			)
		);
	}

	/**
	 * Outputs the frontend of the event listing block
	 *
	 * @param array $attr attributes from block settings.
	 * @return string
	 */
	public function output_calendar( $attributes ) {

		if ( isset( $attributes['defaultView'] ) && '' === $attributes['defaultView'] ) {

			unset( $attributes['defaultView'] );

		}

		if ( is_plugin_active( 'woocommerce/woocommerce.php' ) && is_product() ) {

			$attributes['productIDs'][] = get_the_ID();

		}

		if ( isset( $attributes['productIDs'] ) ) {

			$attributes['post'] = implode( ',', $attributes['productIDs'] );
			unset( $attributes['productIDs'] );

		}

		if ( isset( $attributes['hashtags'] ) ) {

			$attributes['include_cat'] = implode( ',', $attributes['hashtags'] );
			unset( $attributes['hashtags'] );

		}

		if ( isset( $attributes['defaultTimeFormat'] ) ) {

			$attributes['timeFormat'] = $attributes['defaultTimeFormat'];
			unset( $attributes['defaultTimeFormat'] );

		}

		if ( isset( $attributes['limitEvents'] ) && $attributes['limitEvents'] && isset( $attributes['numberOfEvents'] ) ) {

			$attributes['num'] = $attributes['numberOfEvents'];
			unset( $attributes['numberOfEvents'] );
			unset( $attributes['limitEvents'] );

		}

		if ( isset( $attributes['defaultDate'] ) && empty( $attributes['defaultDate'] ) ) {

			unset( $attributes['defaultDate'] );

		}

		$fooevents_calendar = new FooEvents_Calendar();

		$calendar = $fooevents_calendar->display_calendar( $attributes );

		return $calendar;
	}
}
