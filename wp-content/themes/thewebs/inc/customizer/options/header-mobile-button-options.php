<?php
/**
 * Header Main Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

Theme_Customizer::add_settings(
	array(
		'mobile_button_tabs' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'mobile_button',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs' ),
					'target' => 'mobile_button',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs' ),
					'target' => 'mobile_button_design',
				),
				'active' => 'general',
			),
		),
		'mobile_button_tabs_design' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'mobile_button_design',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs' ),
					'target' => 'mobile_button',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs' ),
					'target' => 'mobile_button_design',
				),
				'active' => 'design',
			),
		),
		'mobile_button_style' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'mobile_button',
			'priority'     => 4,
			'default'      => thewebs()->default( 'mobile_button_style' ),
			'label'        => esc_html__( 'Button Style', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.mobile-header-button-wrap .mobile-header-button',
					'pattern'  => 'button-style-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'filled' => array(
						'name'    => __( 'Filled', 'thewebs' ),
					),
					'outline' => array(
						'name'    => __( 'Outline', 'thewebs' ),
						'icon'    => '',
					),
				),
				'responsive' => false,
			),
		),
		'mobile_button_size' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'mobile_button',
			'priority'     => 4,
			'default'      => thewebs()->default( 'mobile_button_size' ),
			'label'        => esc_html__( 'Button Size', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.mobile-header-button-wrap .mobile-header-button',
					'pattern'  => 'button-size-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'small' => array(
						'name'    => __( 'Small', 'thewebs' ),
					),
					'medium' => array(
						'name'    => __( 'Medium', 'thewebs' ),
						'icon'    => '',
					),
					'large' => array(
						'name'    => __( 'Large', 'thewebs' ),
						'icon'    => '',
					),
				),
				'responsive' => false,
			),
		),
		'mobile_button_label' => array(
			'control_type' => 'thewebs_text_control',
			'section'      => 'mobile_button',
			'priority'     => 4,
			'sanitize'     => 'sanitize_text_field',
			'label'        => esc_html__( 'Label', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_label' ),
			'live_method'     => array(
				array(
					'type'     => 'html',
					'selector' => '.mobile-header-button-wrap .mobile-header-button',
					'pattern'  => '$',
					'key'      => '',
				),
			),
		),
		'mobile_button_link' => array(
			'control_type' => 'thewebs_text_control',
			'section'      => 'mobile_button',
			'sanitize'     => 'esc_url_raw',
			'label'        => esc_html__( 'URL', 'thewebs' ),
			'priority'     => 4,
			'default'      => thewebs()->default( 'mobile_button_link' ),
			'partial'      => array(
				'selector'            => '.mobile-header-button-wrap',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs\mobile_button',
			),
		),
		'mobile_button_target' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'mobile_button',
			'priority'     => 6,
			'default'      => thewebs()->default( 'mobile_button_target' ),
			'label'        => esc_html__( 'Open in New Tab?', 'thewebs' ),
		),
		'mobile_button_nofollow' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'mobile_button',
			'priority'     => 6,
			'default'      => thewebs()->default( 'mobile_button_nofollow' ),
			'label'        => esc_html__( 'Set link to nofollow?', 'thewebs' ),
		),
		'mobile_button_sponsored' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'mobile_button',
			'priority'     => 6,
			'default'      => thewebs()->default( 'mobile_button_sponsored' ),
			'label'        => esc_html__( 'Set link attribute Sponsored?', 'thewebs' ),
		),
		'mobile_button_visibility' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'mobile_button',
			'priority'     => 4,
			'default'      => thewebs()->default( 'mobile_button_visibility' ),
			'label'        => esc_html__( 'Button Visibility', 'thewebs' ),
			'partial'      => array(
				'selector'            => '.mobile-header-button-wrap',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs\mobile_button',
			),
			'input_attrs'  => array(
				'layout' => array(
					'all' => array(
						'name'    => __( 'Everyone', 'thewebs' ),
					),
					'loggedout' => array(
						'name'    => __( 'Logged Out Only', 'thewebs' ),
					),
					'loggedin' => array(
						'name'    => __( 'Logged In Only', 'thewebs' ),
					),
				),
				'responsive' => false,
			),
		),
		'mobile_button_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Text Colors', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_color' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button:hover',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs' ),
						'palette' => true,
					),
				),
			),
		),
		'mobile_button_background' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Background Colors', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button:hover',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'mobile_button_style',
					'operator'   => '=',
					'value'      => 'filled',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs' ),
						'palette' => true,
					),
				),
			),
		),
		'mobile_button_border_colors' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Border Colors', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_border' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'border-color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button:hover',
					'property' => 'border-color',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs' ),
						'palette' => true,
					),
				),
			),
		),
		'mobile_button_border' => array(
			'control_type' => 'thewebs_border_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Border', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_border' ),
			'live_method'     => array(
				array(
					'type'     => 'css_border',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'border',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
			'input_attrs'  => array(
				'responsive' => false,
				'color'      => false,
			),
		),
		'mobile_button_radius' => array(
			'control_type' => 'thewebs_measure_control',
			'section'      => 'mobile_button_design',
			'priority'     => 10,
			'default'      => thewebs()->default( 'mobile_button_radius' ),
			'label'        => esc_html__( 'Border Radius', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'border-radius',
					'pattern'  => '$',
					'key'      => 'measure',
				),
			),
			'input_attrs'  => array(
				'responsive' => false,
			),
		),
		'mobile_button_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Font', 'thewebs' ),
			'default'      => thewebs()->default( 'mobile_button_typography' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
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
				'id' => 'mobile_button_typography',
				'options' => 'no-color',
			),
		),
		'mobile_button_shadow' => array(
			'control_type' => 'thewebs_shadow_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Button Shadow', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css_boxshadow',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'box-shadow',
					'pattern'  => '$',
					'key'      => '',
				),
			),
			'default'      => thewebs()->default( 'mobile_button_shadow' ),
		),
		'mobile_button_shadow_hover' => array(
			'control_type' => 'thewebs_shadow_control',
			'section'      => 'mobile_button_design',
			'label'        => esc_html__( 'Button Hover State Shadow', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css_boxshadow',
					'selector' => '.mobile-header-button-wrap .mobile-header-button-inner-wrap .mobile-header-button',
					'property' => 'box-shadow',
					'pattern'  => '$',
					'key'      => '',
				),
			),
			'default'      => thewebs()->default( 'mobile_button_shadow_hover' ),
		),
		'mobile_button_margin' => array(
			'control_type' => 'thewebs_measure_control',
			'section'      => 'mobile_button_design',
			'priority'     => 10,
			'default'      => thewebs()->default( 'mobile_button_margin' ),
			'label'        => esc_html__( 'Margin', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.mobile-header-button-wrap .mobile-header-button',
					'property' => 'margin',
					'pattern'  => '$',
					'key'      => 'measure',
				),
			),
			'input_attrs'  => array(
				'responsive' => false,
			),
		),
	)
);
