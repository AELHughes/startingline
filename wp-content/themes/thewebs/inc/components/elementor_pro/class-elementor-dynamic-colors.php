<?php
/**
 * Thewebs\Elementor_Pro\Component class
 *
 * @package thewebs
 */

namespace Thewebs\Elementor_Pro;

use Thewebs\Component_Interface;
use Elementor;
use \ElementorPro\Modules\DynamicTags\Tags\Base\Data_Tag;
use \Elementor\Modules\DynamicTags\Module;
use \Elementor\Controls_Manager;
use function Thewebs\thewebs;
use function add_action;

if ( class_exists( '\ElementorPro\Modules\DynamicTags\Tags\Base\Data_Tag' ) ) {

	/**
	 * Class for adding Elementor plugin support.
	 */
	class Elementor_Dynamic_Colors extends \ElementorPro\Modules\DynamicTags\Tags\Base\Data_Tag {

		/**
		 * Get Name
		 *
		 * Returns the Name of the tag
		 *
		 * @since 2.0.0
		 * @access public
		 *
		 * @return string
		 */
		public function get_name() {
			return 'thewebs-color-palette';
		}

		/**
		 * Get Title
		 *
		 * Returns the title of the Tag
		 *
		 * @since 2.0.0
		 * @access public
		 *
		 * @return string
		 */
		public function get_title() {
			return __( 'Thewebs Color Palette', 'thewebs' );
		}

		/**
		 * Get Group
		 *
		 * Returns the Group of the tag
		 *
		 * @since 2.0.0
		 * @access public
		 *
		 * @return string
		 */
		public function get_group() {
			return 'thewebs-palette';
		}

		/**
		 * Get Categories
		 *
		 * Returns an array of tag categories
		 *
		 * @since 2.0.0
		 * @access public
		 *
		 * @return array
		 */
		public function get_categories() {
			return [ \Elementor\Modules\DynamicTags\Module::COLOR_CATEGORY ];
		}

		/**
		 * Register Controls
		 *
		 * Registers the Dynamic tag controls
		 *
		 * @since 2.0.0
		 * @access protected
		 *
		 * @return void
		 */
		protected function register_controls() {

			$variables = array(
				'palette1' => __( '1 - Accent', 'thewebs' ),
				'palette2' => __( '2 - Accent - alt', 'thewebs' ),
				'palette3' => __( '3 - Strongest text', 'thewebs' ),
				'palette4' => __( '4 - Strong Text', 'thewebs' ),
				'palette5' => __( '5 - Medium text', 'thewebs' ),
				'palette6' => __( '6 - Subtle Text', 'thewebs' ),
				'palette7' => __( '7 - Subtle Background', 'thewebs' ),
				'palette8' => __( '8 - Lighter Background', 'thewebs' ),
				'palette9' => __( '9 - White or offwhite', 'thewebs' ),
			);
			$this->add_control(
				'thewebs_palette',
				array(
					'label' => __( 'Color', 'thewebs' ),
					'type' => \Elementor\Controls_Manager::SELECT,
					'options' => $variables,
				)
			);
		}
		/**
		 * Get Value
		 *
		 * Returns the value of the Dynamic tag
		 *
		 * @since 2.0.0
		 * @access public
		 *
		 * @return void
		 */
		public function get_value( array $options = array() ) {
			$param_name = $this->get_settings( 'thewebs_palette' );
			if ( ! $param_name ) {
				return;
			}
			$value = 'var(--global-' . $param_name . ')';
			return $value;
		}
	}
}
