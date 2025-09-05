<?php
/**
 * The blank customize control extends the WP_Customize_Control class.
 *
 * @package customizer-controls
 */

if ( ! class_exists( 'WP_Customize_Control' ) ) {
	return;
}


/**
 * Class Thewebs_Control_Conditional_Select
 *
 * @access public
 */
class Thewebs_Control_Conditional_Heading extends WP_Customize_Control {
	/**
	 * Control type
	 *
	 * @var string
	 */
	public $type = 'thewebs_conditional_heading_control';
	/**
	 * Send to JS.
	 */
	public function to_json() {
		parent::to_json();
	}
	/**
	 * Empty Render Function to prevent errors.
	 */
	public function render_content() {
	}
}
$wp_customize->register_control_type( 'Thewebs_Control_Conditional_Heading' );
