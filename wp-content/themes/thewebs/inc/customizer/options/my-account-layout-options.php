<?php
/**
 * Product Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'info_woo_account_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'account_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'My Account Navigation', 'thewebs' ),
		'settings'     => false,
	),
	'woo_account_navigation_avatar' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'account_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'woo_account_navigation_avatar' ),
		'label'        => esc_html__( 'Show User Name and Avatar?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'woo_account_navigation_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'account_layout',
		'label'        => esc_html__( 'Navigation Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'woo_account_navigation_layout' ),
		'input_attrs'  => array(
			'layout' => array(
				'left' => array(
					'tooltip' => __( 'Positioned on Left Content', 'thewebs' ),
					'name'    => __( 'Left', 'thewebs' ),
					'icon'    => '',
				),
				'above' => array(
					'tooltip' => __( 'Positioned on Top Content', 'thewebs' ),
					'name'    => __( 'Above', 'thewebs' ),
					'icon'    => '',
				),
				'right' => array(
					'tooltip' => __( 'Positioned on Right Content', 'thewebs' ),
					'name'    => __( 'Right', 'thewebs' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
);

Theme_Customizer::add_settings( $settings );

