<?php
/**
 * Header Popup Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'header_popup_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_popup',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'header_popup',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'header_popup_design',
			),
			'active' => 'general',
		),
	),
	'header_popup_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_popup_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'header_popup',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'header_popup_design',
			),
			'active' => 'design',
		),
	),
	'header_popup_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_popup',
		'priority'     => 4,
		'default'      => thewebs()->default( 'header_popup_layout' ),
		'label'        => esc_html__( 'Layout', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#mobile-drawer',
				'pattern'  => 'popup-drawer-layout-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'fullwidth' => array(
					'tooltip' => __( 'Reveal as Fullwidth', 'thewebs' ),
					'name'    => __( 'Fullwidth', 'thewebs' ),
					'icon'    => '',
				),
				'sidepanel' => array(
					'tooltip' => __( 'Reveal as Side Panel', 'thewebs' ),
					'name'    => __( 'Side Panel', 'thewebs' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'header_popup_side' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_popup',
		'priority'     => 4,
		'default'      => thewebs()->default( 'header_popup_side' ),
		'label'        => esc_html__( 'Slide-Out Side', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'header_popup_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'layout',
				'responsive' => false,
				'value'      => 'sidepanel',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#mobile-drawer',
				'pattern'  => 'popup-drawer-side-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'left' => array(
					'tooltip' => __( 'Reveal from Left', 'thewebs' ),
					'name'    => __( 'Left', 'thewebs' ),
					'icon'    => '',
				),
				'right' => array(
					'tooltip' => __( 'Reveal from Right', 'thewebs' ),
					'name'    => __( 'Right', 'thewebs' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'enable_popup_body_animate' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_popup',
		'priority'     => 4,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'enable_popup_body_animate' ),
		'label'        => esc_html__( 'Move Body with toggle?', 'thewebs' ),
		'input_attrs'  => array(
			'help' => esc_html__( 'This can require a lot of memory to render the animation in mobile browsers, use with caution if you have graphically heavy pages.', 'thewebs' ),
		),
		'context'      => array(
			array(
				'setting'    => 'header_popup_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'layout',
				'responsive' => false,
				'value'      => 'sidepanel',
			),
		),
	),
	'header_popup_animation' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_popup',
		'priority'     => 4,
		'default'      => thewebs()->default( 'header_popup_animation' ),
		'label'        => esc_html__( 'Animation', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'header_popup_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'layout',
				'responsive' => false,
				'value'      => 'fullwidth',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#mobile-drawer',
				'pattern'  => 'popup-drawer-animation-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'fade' => array(
					'tooltip' => __( 'Fade In', 'thewebs' ),
					'name'    => __( 'Fade', 'thewebs' ),
					'icon'    => '',
				),
				'scale' => array(
					'tooltip' => __( 'Scale into view', 'thewebs' ),
					'name'    => __( 'Scale', 'thewebs' ),
					'icon'    => '',
				),
				'slice' => array(
					'tooltip' => __( 'Slice into view', 'thewebs' ),
					'name'    => __( 'Slice', 'thewebs' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'header_popup_content_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_popup',
		'label'        => esc_html__( 'Content Align', 'thewebs' ),
		'default'      => thewebs()->default( 'header_popup_content_align' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.mobile-drawer-content',
				'pattern'  => 'content-align-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'left'   => array(
					'tooltip'  => __( 'Left Align', 'thewebs' ),
					'dashicon' => 'editor-alignleft',
				),
				'center' => array(
					'tooltip'  => __( 'Center Align', 'thewebs' ),
					'dashicon' => 'editor-aligncenter',
				),
				'right'  => array(
					'tooltip'  => __( 'Right Align', 'thewebs' ),
					'dashicon' => 'editor-alignright',
				),
			),
			'responsive' => false,
		),
	),
	'header_popup_vertical_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_popup',
		'label'        => esc_html__( 'Content Vertical Align', 'thewebs' ),
		'default'      => thewebs()->default( 'header_popup_vertical_align' ),
		'live_method'  => array(
			array(
				'type'     => 'class',
				'selector' => '.mobile-drawer-content',
				'pattern'  => 'content-valign-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'top' => array(
					'tooltip' => __( 'Top Align', 'thewebs' ),
					'icon'    => 'aligntop',
				),
				'middle' => array(
					'tooltip' => __( 'Middle Align', 'thewebs' ),
					'icon'    => 'alignmiddle',
				),
				'bottom' => array(
					'tooltip' => __( 'Bottom Align', 'thewebs' ),
					'icon'    => 'alignbottom',
				),
			),
			'responsive' => false,
		),
	),
	'header_popup_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'header_popup_design',
		'label'        => esc_html__( 'Popup Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_popup_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#mobile-drawer .drawer-inner, #mobile-drawer.popup-drawer-layout-fullwidth.popup-drawer-animation-slice .pop-portion-bg',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Popup Background', 'thewebs' ),
		),
	),
	'header_popup_close_icon_size' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_popup_design',
		'label'        => esc_html__( 'Close Icon Size', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle',
				'property' => 'font-size',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'header_popup_close_icon_size' ),
		'input_attrs'  => array(
			'min'        => array(
				'px'  => 0,
				'em'  => 0,
				'rem' => 0,
			),
			'max'        => array(
				'px'  => 100,
				'em'  => 12,
				'rem' => 12,
			),
			'step'       => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
			),
			'units'      => array( 'px', 'em', 'rem' ),
			'responsive' => false,
		),
	),
	'header_popup_close_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_popup_design',
		'label'        => esc_html__( 'Close Toggle Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_popup_close_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle:hover',
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
	'header_popup_close_background' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_popup_design',
		'label'        => esc_html__( 'Close Toggle Background Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_popup_close_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle:hover',
				'property' => 'background',
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
	'header_popup_close_padding' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'header_popup_design',
		'default'      => thewebs()->default( 'header_popup_close_padding' ),
		'label'        => esc_html__( 'Close Icon Padding', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#mobile-drawer .drawer-header .drawer-toggle',
				'property' => 'padding',
				'pattern'  => '$',
				'key'      => 'measure',
			),
		),
		'input_attrs'  => array(
			'responsive' => false,
		),
	),
);

Theme_Customizer::add_settings( $settings );

