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
class FooEvents_Calendar_Blocks {

	/**
	 * Configuration object
	 *
	 * @var array $config contains paths and other configurations.
	 */
	private $config;

	/**
	 * Blocks array
	 *
	 * @var array $blocks contains all the FooEvents block objects.
	 */
	public $blocks;

	/**
	 * On plugin load
	 */
	public function __construct() {

		$this->config = new FooEvents_Calendar_Config();

		require_once $this->config->classPath . 'blocks/class-fooevents-calendar-blocks-calendar.php';
		$this->blocks['calendar'] = new FooEvents_Calendar_Blocks_Calendar( $this->config );

	}

}

