<?php
/**
 * Header Builder Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

Theme_Customizer::add_settings(
	array(
		'tertiary_navigation_tabs' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'tertiary_navigation',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs-pro' ),
					'target' => 'tertiary_navigation',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs-pro' ),
					'target' => 'tertiary_navigation_design',
				),
				'active' => 'general',
			),
		),
		'tertiary_navigation_tabs_design' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'tertiary_navigation_design',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs-pro' ),
					'target' => 'tertiary_navigation',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs-pro' ),
					'target' => 'tertiary_navigation_design',
				),
				'active' => 'design',
			),
		),
		'tertiary_navigation_link' => array(
			'control_type' => 'thewebs_focus_button_control',
			'section'      => 'tertiary_navigation',
			'settings'     => false,
			'priority'     => 5,
			'label'        => esc_html__( 'Select Menu', 'thewebs-pro' ),
			'input_attrs'  => array(
				'section' => 'menu_locations',
			),
		),
		'tertiary_navigation_spacing' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'tertiary_navigation',
			'priority'     => 5,
			'label'        => esc_html__( 'Items Spacing', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'padding-left',
					'pattern'  => 'calc($ / 2)',
					'key'      => 'size',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'padding-right',
					'pattern'  => 'calc($ / 2)',
					'key'      => 'size',
				),
			),
			'default'      => thewebs()->default( 'tertiary_navigation_spacing' ),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
					'vw'  => 0,
				),
				'max'        => array(
					'px'  => 100,
					'em'  => 12,
					'rem' => 12,
					'vw'  => 12,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
					'vw'  => 0.01,
				),
				'units'      => array( 'px', 'em', 'rem', 'vw' ),
				'responsive' => false,
			),
		),
		'tertiary_navigation_stretch' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'tertiary_navigation',
			'priority'     => 6,
			'default'      => thewebs()->default( 'tertiary_navigation_stretch' ),
			'label'        => esc_html__( 'Stretch Menu?', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.site-header-item-tertiary-navigation',
					'pattern'  => 'header-navigation-layout-stretch-$',
					'key'      => 'switch',
				),
			),
		),
		'tertiary_navigation_fill_stretch' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'tertiary_navigation',
			'priority'     => 6,
			'default'      => thewebs()->default( 'tertiary_navigation_fill_stretch' ),
			'label'        => esc_html__( 'Fill and Center Menu Items?', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'  => 'tertiary_navigation_stretch',
					'operator' => '==',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.site-header-item-tertiary-navigation',
					'pattern'  => 'header-navigation-layout-fill-stretch-$',
					'key'      => 'switch',
				),
			),
		),
		'tertiary_navigation_style' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'tertiary_navigation_design',
			'priority'     => 10,
			'default'      => thewebs()->default( 'tertiary_navigation_style' ),
			'label'        => esc_html__( 'Navigation Style', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.tertiary-navigation',
					'pattern'  => 'header-navigation-style-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'standard' => array(
						'tooltip' => __( 'Standard', 'thewebs-pro' ),
						'name'    => __( 'Standard', 'thewebs-pro' ),
						'icon'    => '',
					),
					'fullheight' => array(
						'tooltip' => __( 'Menu items are full height', 'thewebs-pro' ),
						'name'    => __( 'Full Height', 'thewebs-pro' ),
						'icon'    => '',
					),
					'underline' => array(
						'tooltip' => __( 'Underline Hover/Active', 'thewebs-pro' ),
						'name'    => __( 'Underline', 'thewebs-pro' ),
						'icon'    => '',
					),
					'underline-fullheight' => array(
						'tooltip' => __( 'Full Height Underline Hover/Active', 'thewebs-pro' ),
						'name'    => __( 'Full Height Underline', 'thewebs-pro' ),
						'icon'    => '',
					),
				),
				'responsive' => false,
				'class'      => 'radio-btn-width-50',
			),
		),
		'tertiary_navigation_vertical_spacing' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'tertiary_navigation_design',
			'label'        => esc_html__( 'Items Top and Bottom Padding', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'    => 'tertiary_navigation_style',
					'operator'   => 'sub_object_does_not_contain',
					'sub_key'    => 'layout',
					'responsive' => false,
					'value'      => 'fullheight',
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'padding-top',
					'pattern'  => '$',
					'key'      => 'size',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'padding-bottom',
					'pattern'  => '$',
					'key'      => 'size',
				),
			),
			'default'      => thewebs()->default( 'tertiary_navigation_vertical_spacing' ),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
					'vh'  => 0,
				),
				'max'        => array(
					'px'  => 100,
					'em'  => 12,
					'rem' => 12,
					'vh'  => 12,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
					'vh'  => 0.01,
				),
				'units'      => array( 'px', 'em', 'rem', 'vh' ),
				'responsive' => false,
			),
		),
		'tertiary_navigation_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'tertiary_navigation_design',
			'label'        => esc_html__( 'Navigation Colors', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'tertiary_navigation_color' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a:hover',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'hover',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li.current-menu-item > a, .tertiary-navigation .tertiary-menu-container > ul > li.current_page_item > a',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'active',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs-pro' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs-pro' ),
						'palette' => true,
					),
					'active' => array(
						'tooltip' => __( 'Active Color', 'thewebs-pro' ),
						'palette' => true,
					),
				),
			),
		),
		'tertiary_navigation_background' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'tertiary_navigation_design',
			'label'        => esc_html__( 'Navigation Background', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'tertiary_navigation_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li > a:hover',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'hover',
				),
				array(
					'type'     => 'css',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li.current-menu-item > a, .tertiary-navigation .tertiary-menu-container > ul > li.current_page_item > a',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'active',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Background', 'thewebs-pro' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Background', 'thewebs-pro' ),
						'palette' => true,
					),
					'active' => array(
						'tooltip' => __( 'Active Background', 'thewebs-pro' ),
						'palette' => true,
					),
				),
			),
		),
		'tertiary_navigation_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'tertiary_navigation_design',
			'label'        => esc_html__( 'Navigation Font', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'tertiary_navigation_typography' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.tertiary-navigation .tertiary-menu-container > ul > li a',
					'pattern'  => array(
						'desktop' => '$',
						'tablet'  => '$',
						'mobile'  => '$',
					),
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'      => 'tertiary_navigation_typography',
				'options' => 'no-color',
			),
		),
		'info_tertiary_submenu' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'tertiary_navigation',
			'priority'     => 20,
			'label'        => esc_html__( 'Dropdown Options', 'thewebs-pro' ),
			'settings'     => false,
		),
		'tertiary_dropdown_link' => array(
			'control_type' => 'thewebs_focus_button_control',
			'section'      => 'tertiary_navigation',
			'settings'     => false,
			'priority'     => 20,
			'label'        => esc_html__( 'Dropdown Options', 'thewebs-pro' ),
			'input_attrs'  => array(
				'section' => 'thewebs_customizer_dropdown_navigation',
			),
		),
	)
);

