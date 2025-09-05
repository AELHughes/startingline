<?php
/**
 * Header Account Options.
 *
 * @package Thewebs_Pro
 */

namespace Thewebs_Pro;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;
$preview_options = array(
	'' => array(
		'name' => __( 'Default', 'thewebs-pro' ),
	),
);
$headers = thewebs()->option( 'conditional_headers' );
if ( ! empty( $headers['items'] ) && is_array( $headers['items'] ) ) {
	foreach ( $headers['items'] as $header ) {
		$preview_options[ $header['id'] ] = array(
			'name' => $header['label'],
		);
	}
}
$settings = array(
	'header_conditional_heading' => array(
		'control_type' => 'thewebs_conditional_heading_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'priority'     => 5,
		'label'        => esc_html__( 'Previewing Header:', 'thewebs-pro' ),
	),
	'header_conditional_link' => array(
		'control_type' => 'thewebs_focus_button_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'priority'     => 21,
		'label'        => esc_html__( 'Conditional Header', 'thewebs-pro' ),
		'input_attrs'  => array(
			'section' => 'thewebs_customizer_conditional_header',
		),
	),
	'current_header_preview' => array(
		'control_type' => 'thewebs_conditional_select_control',
		'section'      => 'conditional_header',
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'current_header_preview' ),
		'label'        => esc_html__( 'Current Previewing Header', 'thewebs-pro' ),
		'input_attrs'  => array(
			'options' => $preview_options,
		),
	),
	'conditional_headers' => array(
		'control_type' => 'thewebs_conditional_control',
		'section'      => 'conditional_header',
		'default'      => thewebs()->default( 'conditional_headers' ),
		'label'        => esc_html__( 'Conditional Headers', 'thewebs-pro' ),
	),
);

Theme_Customizer::add_settings( $settings );
