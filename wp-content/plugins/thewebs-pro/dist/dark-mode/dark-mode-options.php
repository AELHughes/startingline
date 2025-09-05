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
		'dark_mode_enable' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_enable' ),
			'label'        => esc_html__( 'Enable Color Palette Switch (Dark Mode)?', 'thewebs-pro' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'Please Note, this simply allows your users to switch which color palette is active. This will not automatically convert your site to have a dark mode version.', 'thewebs-pro' ),
			),
			'transport'    => 'refresh',
		),
		'dark_mode_default' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_default' ),
			'label'        => esc_html__( 'Default Color Palette', 'thewebs-pro' ),
			'input_attrs'  => array(
				'options' => array(
					'light' => array(
						'name' => __( 'Light', 'thewebs-pro' ),
					),
					'dark' => array(
						'name' => __( 'Dark', 'thewebs-pro' ),
					),
				),
			),
			'transport'    => 'refresh',
		),
		'dark_mode_os_aware' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_os_aware' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'Use users computer settings to choose default palette', 'thewebs-pro' ),
			),
			'label'        => esc_html__( 'OS Aware', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'dark_mode_dark_palette' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_dark_palette' ),
			'label'        => esc_html__( 'Dark Color Palette', 'thewebs-pro' ),
			'input_attrs'  => array(
				'options' => array(
					'palette' => array(
						'name' => __( 'Palette 1', 'thewebs-pro' ),
					),
					'second-palette' => array(
						'name' => __( 'Palette 2', 'thewebs-pro' ),
					),
					'third-palette' => array(
						'name' => __( 'Palette 3', 'thewebs-pro' ),
					),
				),
			),
			'transport'    => 'refresh',
		),
		'dark_mode_custom_logo' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_custom_logo' ),
			'label'        => esc_html__( 'Different Logo for Dark Mode?', 'thewebs-pro' ),
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'    => 'logo_layout',
					'operator'   => 'sub_object_contains',
					'sub_key'    => 'include',
					'responsive' => true,
					'value'      => 'logo',
				),
			),
		),
		'dark_mode_logo' => array(
			'control_type' => 'media',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'transport'    => 'refresh',
			'mime_type'    => 'image',
			'default'      => '',
			'label'        => esc_html__( 'Dark Mode Header Logo', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'    => 'logo_layout',
					'operator'   => 'sub_object_contains',
					'sub_key'    => 'include',
					'responsive' => true,
					'value'      => 'logo',
				),
				array(
					'setting'  => 'dark_mode_custom_logo',
					'operator' => '=',
					'value'    => true,
				),
			),
		),
		'dark_mode_mobile_custom_logo' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'default'      => thewebs()->default( 'dark_mode_mobile_custom_logo' ),
			'label'        => esc_html__( 'Different Logo for Mobile?', 'thewebs-pro' ),
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'    => 'logo_layout',
					'operator'   => 'sub_object_contains',
					'sub_key'    => 'include',
					'responsive' => true,
					'value'      => 'logo',
				),
				array(
					'setting'  => 'dark_mode_custom_logo',
					'operator' => '=',
					'value'    => true,
				),
			),
		),
		'dark_mode_mobile_logo' => array(
			'control_type' => 'media',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'transport'    => 'refresh',
			'mime_type'    => 'image',
			'default'      => '',
			'label'        => esc_html__( 'Dark Mode Header Logo', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'    => 'logo_layout',
					'operator'   => 'sub_object_contains',
					'sub_key'    => 'include',
					'responsive' => true,
					'value'      => 'logo',
				),
				array(
					'setting'  => 'dark_mode_mobile_custom_logo',
					'operator' => '=',
					'value'    => true,
				),
				array(
					'setting'  => 'dark_mode_custom_logo',
					'operator' => '=',
					'value'    => true,
				),
			),
		),
		'info_dark_mode_switch' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'dark_mode',
			'priority'     => 10,
			'label'        => esc_html__( 'Fixed Switch', 'thewebs-pro' ),
			'settings'     => false,
		),
		'dark_mode_switch_show' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'dark_mode_switch_show' ),
			'label'        => esc_html__( 'Show Fixed Switch?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'dark_mode_switch_type' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'dark_mode_switch_type' ),
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
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_switch_style' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'dark_mode_switch_style' ),
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
					'selector' => '.thewebs-color-palette-fixed-switcher .thewebs-color-palette-switcher',
					'pattern'  => 'kcps-style-$',
					'key'      => '',
				),
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_switch_position' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'default'      => thewebs()->default( 'dark_mode_switch_position' ),
			'label'        => esc_html__( 'Switch Align', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.thewebs-color-palette-fixed-switcher',
					'pattern'  => 'kcpf-position-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'left' => array(
						'name'    => __( 'Left', 'thewebs-pro' ),
						'icon'    => '',
					),
					'right' => array(
						'name'    => __( 'Right', 'thewebs-pro' ),
						'icon'    => '',
					),
				),
				'responsive' => false,
			),
		),
		'dark_mode_switch_side_offset' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'label'        => esc_html__( 'Side Offset', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_switch_side_offset' ),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-fixed-switcher.kcpf-position-right',
					'pattern'  => '$',
					'property' => 'right',
					'key'      => 'size',
				),
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-fixed-switcher.kcpf-position-left',
					'pattern'  => '$',
					'property' => 'left',
					'key'      => 'size',
				),
			),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
					'vw'  => 0,
				),
				'max'        => array(
					'px'  => 600,
					'em'  => 20,
					'rem' => 20,
					'vw'  => 100,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
					'vw' => 1,
				),
				'units'      => array( 'px', 'em', 'rem', 'vw' ),
				'responsive' => true,
			),
		),
		'dark_mode_switch_bottom_offset' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'dark_mode',
			'priority'     => 11,
			'label'        => esc_html__( 'Bottom Offset', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_switch_bottom_offset' ),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-fixed-switcher',
					'pattern'  => '$',
					'property' => 'bottom',
					'key'      => 'size',
				),
			),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
					'vh'  => 0,
				),
				'max'        => array(
					'px'  => 600,
					'em'  => 20,
					'rem' => 20,
					'vh'  => 100,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
					'vh' => 1,
				),
				'units'      => array( 'px', 'em', 'rem', 'vh' ),
				'responsive' => true,
			),
		),
		'dark_mode_light_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'dark_mode',
			'priority'     => 12,
			'default'      => thewebs()->default( 'dark_mode_light_icon' ),
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
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_dark_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'dark_mode',
			'priority'     => 12,
			'default'      => thewebs()->default( 'dark_mode_dark_icon' ),
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
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_icon_size' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Icon Size', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.thewebs-color-palette-fixed-switcher .thewebs-color-palette-switcher button.thewebs-color-palette-toggle .thewebs-color-palette-icon',
					'property' => 'font-size',
					'pattern'  => '$',
					'key'      => 'size',
				),
			),
			'default'      => thewebs()->default( 'dark_mode_icon_size' ),
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
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_colors' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Switch Colors', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_colors' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => 'html body',
					'property' => '--global-light-toggle-switch',
					'pattern'  => '$',
					'key'      => 'light',
				),
				array(
					'type'     => 'css',
					'selector' => 'html body',
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
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'dark_mode',
			'priority'     => 12,
			'label'        => esc_html__( 'Text Label Font', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_typography' ),
			'context'      => array(
				array(
					'setting'    => 'dark_mode_switch_type',
					'operator'   => '!=',
					'value'      => 'icon',
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.thewebs-color-palette-fixed-switcher .thewebs-color-palette-switcher button.thewebs-color-palette-toggle .thewebs-color-palette-label',
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
				'id'      => 'dark_mode_typography',
				'options' => 'no-color',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_switch_tooltip' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'dark_mode',
			'priority'     => 20,
			'default'      => thewebs()->default( 'dark_mode_switch_tooltip' ),
			'label'        => esc_html__( 'Enable Tooltip?', 'thewebs-pro' ),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
				array(
					'setting'  => 'dark_mode_switch_style',
					'operator' => '==',
					'value'    => 'button',
				),
				array(
					'setting'  => 'dark_mode_switch_type',
					'operator' => '==',
					'value'    => 'icon',
				),
			),
		),
		'dark_mode_light_switch_title' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'dark_mode',
			'priority'     => 20,
			'label'        => esc_html__( 'Light Palette Title', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_light_switch_title' ),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_dark_switch_title' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'dark_mode',
			'priority'     => 20,
			'label'        => esc_html__( 'Dark Palette Title', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'dark_mode_dark_switch_title' ),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
		),
		'dark_mode_switch_visibility' => array(
			'control_type' => 'thewebs_check_icon_control',
			'section'      => 'dark_mode',
			'priority'     => 22,
			'default'      => thewebs()->default( 'dark_mode_switch_visibility' ),
			'label'        => esc_html__( 'Visibility', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'  => 'dark_mode_switch_show',
					'operator' => '==',
					'value'    => true,
				),
			),
			'partial'      => array(
				'selector'            => '.thewebs-color-palette-fixed-switcher',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs_Pro\fixed_color_switcher',
			),
			'input_attrs'  => array(
				'options' => array(
					'desktop' => array(
						'name' => __( 'Desktop', 'thewebs-pro' ),
						'icon' => 'desktop',
					),
					'tablet' => array(
						'name' => __( 'Tablet', 'thewebs-pro' ),
						'icon' => 'tablet',
					),
					'mobile' => array(
						'name' => __( 'Mobile', 'thewebs-pro' ),
						'icon' => 'smartphone',
					),
				),
			),
		),
	)
);
