<?php
/**
 * Dark Mode Options.
 *
 * @package Thewebs_Pro
 */

namespace Thewebs_Pro;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;
Theme_Customizer::add_settings(
	array(
		'info_mobile_dark_mode_switch' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 1,
			'label'        => esc_html__( '*You must Enable Dark Mode', 'thewebs-pro' ),
			'description'  => esc_html__( 'To view the color switcher you must enable dark mode under General then Color Switch (Dark Mode)', 'thewebs-pro' ),
			'settings'     => false,
			'context'      => array(
				array(
					'setting'  => 'dark_mode_enable',
					'operator' => '!=',
					'value'    => true,
				),
			),
		),
		'mobile_dark_mode_switch_type' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'mobile_dark_mode_switch_type' ),
			'label'        => esc_html__( 'Switch Type', 'thewebs-pro' ),
			'input_attrs'  => array(
				'options' => array(
					'icon' => array(
						'name' => __( 'Icons', 'thewebs-pro' ),
					),
					'text' => array(
						'name' => __( 'Text', 'thewebs-pro' ),
					),
					'both' => array(
						'name' => __( 'Icons and Text', 'thewebs-pro' ),
					),
				),
			),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-mobile-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\mobile_color_switcher',
			),
		),
		'mobile_dark_mode_switch_style' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'mobile_dark_mode_switch_style' ),
			'label'        => esc_html__( 'Switch Style', 'thewebs-pro' ),
			'input_attrs'  => array(
				'options' => array(
					'button' => array(
						'name' => __( 'Button', 'thewebs-pro' ),
					),
					'switch' => array(
						'name' => __( 'Switch', 'thewebs-pro' ),
					),
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.thewebs-color-palette-mobile-switcher .thewebs-color-palette-switcher',
					'pattern'  => 'kcps-style-$',
					'key'      => '',
				),
			),
		),
		'mobile_dark_mode_light_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 12,
			'default'      => thewebs()->default( 'mobile_dark_mode_light_icon' ),
			'label'        => esc_html__( 'Light Mode Icon', 'thewebs-pro' ),
			'input_attrs'  => array(
				'layout' => array(
					'sun' => array(
						'icon' => 'sun',
					),
					'sunAlt' => array(
						'icon' => 'sunAlt',
					),
					'sunrise' => array(
						'icon' => 'sunrise',
					),
				),
				'responsive' => false,
			),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-mobile-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\mobile_color_switcher',
			),
		),
		'mobile_dark_mode_dark_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 12,
			'default'      => thewebs()->default( 'mobile_dark_mode_dark_icon' ),
			'label'        => esc_html__( 'Dark Mode Icon', 'thewebs-pro' ),
			'input_attrs'  => array(
				'layout' => array(
					'moon' => array(
						'icon' => 'moon',
					),
					'moonAlt' => array(
						'icon' => 'moonAlt',
					),
					'sunset' => array(
						'icon' => 'sunset',
					),
				),
				'responsive' => false,
			),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-mobile-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\mobile_color_switcher',
			),
		),
		'mobile_dark_mode_icon_size' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Icon Size', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-mobile-switcher .thewebs-color-palette-switcher button.thewebs-color-palette-toggle .thewebs-color-palette-icon',
					'property' => 'font-size',
					'pattern'  => '$',
					'key'      => 'size',
				),
			),
			'default'      => thewebs()->default( 'mobile_dark_mode_icon_size' ),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
				),
				'max'        => array(
					'px'  => 200,
					'em'  => 12,
					'rem' => 12,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
				),
				'units'      => array( 'px', 'em', 'rem' ),
				'responsive' => true,
			),
		),
		'mobile_dark_mode_colors' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Switch Colors', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'mobile_dark_mode_colors' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-mobile-switcher',
					'property' => '--global-light-toggle-switch',
					'pattern'  => '$',
					'key'      => 'light',
				),
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-mobile-switcher',
					'property' => '--global-dark-toggle-switch',
					'pattern'  => '$',
					'key'      => 'dark',
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'light' => array(
						'tooltip' => __( 'Light Color', 'thewebs-pro' ),
						'palette' => false,
					),
					'dark' => array(
						'tooltip' => __( 'Dark Color', 'thewebs-pro' ),
						'palette' => false,
					),
				),
			),
		),
		'mobile_dark_mode_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Text Label Font', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'mobile_dark_mode_typography' ),
			'context'      => array(
				array(
					'setting'    => 'mobile_dark_mode_switch_type',
					'operator'   => '!=',
					'value'      => 'icon',
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.thewebs-color-palette-mobile-switcher .thewebs-color-palette-switcher button.thewebs-color-palette-toggle .thewebs-color-palette-label',
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
				'id'      => 'mobile_dark_mode_typography',
				'options' => 'no-color',
			),
		),
		'mobile_dark_mode_light_switch_title' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'mobile_dark_mode',
			'priority'     => 20,
			'label'        => esc_html__( 'Light Palette Title', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'mobile_dark_mode_light_switch_title' ),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-mobile-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\mobile_color_switcher',
			),
		),
		'mobile_dark_mode_dark_switch_title' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'mobile_dark_mode',
			'priority'     => 20,
			'label'        => esc_html__( 'Dark Palette Title', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'mobile_dark_mode_dark_switch_title' ),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-mobile-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\mobile_color_switcher',
			),
		),
		'mobile_dark_mode_switch_margin' => array(
			'control_type' => 'thewebs_measure_control',
			'section'      => 'mobile_dark_mode',
			'priority'     => 20,
			'default'      => thewebs()->default( 'mobile_dark_mode_switch_margin' ),
			'label'        => esc_html__( 'Margin', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-mobile-switcher .thewebs-color-palette-switcher',
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
