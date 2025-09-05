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
	'info_llms_dashboard_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'llms_dashboard_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Dashboard Navigation', 'thewebs' ),
		'settings'     => false,
	),
	'llms_dashboard_navigation_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_dashboard_layout',
		'label'        => esc_html__( 'Navigation Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'llms_dashboard_navigation_layout' ),
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
	'llms_dashboard_archive_columns' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_dashboard_layout',
		'priority'     => 20,
		'label'        => esc_html__( 'Course and Membership Items Columns', 'thewebs' ),
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'llms_dashboard_archive_columns' ),
		'input_attrs'  => array(
			'layout' => array(
				'2' => array(
					'name' => __( '2', 'thewebs' ),
				),
				'3' => array(
					'name' => __( '3', 'thewebs' ),
				),
				'4' => array(
					'name' => __( '4', 'thewebs' ),
				),
			),
			'responsive' => false,
		),
	),
);

Theme_Customizer::add_settings( $settings );

