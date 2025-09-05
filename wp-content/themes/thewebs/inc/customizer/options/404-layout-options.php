<?php
/**
 * 404 Layout options.
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$layout_404_settings = array(
	'404_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'general_404',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'general_404',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'general_404_design',
			),
			'active' => 'general',
		),
	),
	'404_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'general_404_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'general_404',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'general_404_design',
			),
			'active' => 'design',
		),
	),
	'info_404_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'general_404',
		'priority'     => 10,
		'label'        => esc_html__( '404 Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_404_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'general_404_design',
		'priority'     => 10,
		'label'        => esc_html__( '404 Layout', 'thewebs' ),
		'settings'     => false,
	),
	'404_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'general_404',
		'label'        => esc_html__( '404 Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( '404_layout' ),
		'input_attrs'  => array(
			'layout' => array(
				'normal' => array(
					'name' => __( 'Normal', 'thewebs' ),
					'icon' => 'normal',
				),
				'narrow' => array(
					'name' => __( 'Narrow', 'thewebs' ),
					'icon' => 'narrow',
				),
				'fullwidth' => array(
					'name' => __( 'Fullwidth', 'thewebs' ),
					'icon' => 'fullwidth',
				),
				'left' => array(
					'name' => __( 'Left Sidebar', 'thewebs' ),
					'icon' => 'leftsidebar',
				),
				'right' => array(
					'name' => __( 'Right Sidebar', 'thewebs' ),
					'icon' => 'rightsidebar',
				),
			),
			'class'      => 'thewebs-three-col',
			'responsive' => false,
		),
	),
	'404_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'general_404',
		'label'        => esc_html__( '404 Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( '404_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'404_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'general_404',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( '404_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.error404',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'name' => __( 'Boxed', 'thewebs' ),
					'icon' => 'boxed',
				),
				'unboxed' => array(
					'name' => __( 'Unboxed', 'thewebs' ),
					'icon' => 'narrow',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'404_vertical_padding' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'general_404',
		'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( '404_vertical_padding' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.error404',
				'pattern'  => 'content-vertical-padding-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'show' => array(
					'name' => __( 'Enable', 'thewebs' ),
				),
				'hide' => array(
					'name' => __( 'Disable', 'thewebs' ),
				),
				'top' => array(
					'name' => __( 'Top Only', 'thewebs' ),
				),
				'bottom' => array(
					'name' => __( 'Bottom Only', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-grid',
		),
	),
	'404_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'general_404_design',
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( '404_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.error404',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( '404 Background', 'thewebs' ),
		),
	),
	'404_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'general_404_design',
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( '404_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.error404 .content-bg, body.error404.content-style-unboxed .site',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( '404 Content Background', 'thewebs' ),
		),
	),
);
Theme_Customizer::add_settings( $layout_404_settings );
