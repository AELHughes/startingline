<?php
/**
 * Header Main Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'info_tribe_events_archive_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'tribe_events_archive',
		'priority'     => 10,
		'label'        => esc_html__( 'Events Layout', 'thewebs' ),
		'settings'     => false,
	),
	'tribe_events_archive_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'tribe_events_archive',
		'label'        => esc_html__( 'Events Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'tribe_events_archive_layout' ),
		'input_attrs'  => array(
			'layout' => array(
				'normal' => array(
					'tooltip' => __( 'Normal', 'thewebs' ),
					'icon' => 'normal',
				),
				'narrow' => array(
					'tooltip' => __( 'Narrow', 'thewebs' ),
					'icon' => 'narrow',
				),
				'fullwidth' => array(
					'tooltip' => __( 'Fullwidth', 'thewebs' ),
					'icon' => 'fullwidth',
				),
				'left' => array(
					'tooltip' => __( 'Left Sidebar', 'thewebs' ),
					'icon' => 'leftsidebar',
				),
				'right' => array(
					'tooltip' => __( 'Right Sidebar', 'thewebs' ),
					'icon' => 'rightsidebar',
				),
			),
			'class'      => 'thewebs-three-col',
			'responsive' => false,
		),
	),
	'tribe_events_archive_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'tribe_events_archive',
		'label'        => esc_html__( 'Events Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'tribe_events_archive_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'tribe_events_archive_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'tribe_events_archive',
		'label'        => esc_html__( 'Events Background', 'thewebs' ),
		'default'      => thewebs()->default( 'tribe_events_archive_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.post-type-archive-tribe_events .site, body.post-type-archive-tribe_events.content-style-unboxed .site',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Events Background', 'thewebs' ),
		),
	),
);

Theme_Customizer::add_settings( $settings );

