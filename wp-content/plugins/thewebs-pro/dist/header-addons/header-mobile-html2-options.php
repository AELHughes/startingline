<?php
/**
 * Header HTML2 Options
 *
 * @package Thewebs_Pro
 */

namespace Thewebs_Pro;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'header_mobile_html2_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_mobile_html2',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs-pro' ),
				'target' => 'header_mobile_html2',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs-pro' ),
				'target' => 'header_mobile_html2_design',
			),
			'active' => 'general',
		),
	),
	'header_mobile_html2_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_mobile_html2_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs-pro' ),
				'target' => 'header_mobile_html2',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs-pro' ),
				'target' => 'header_mobile_html2_design',
			),
			'active' => 'design',
		),
	),
	'header_mobile_html2_content' => array(
		'control_type' => 'thewebs_editor_control',
		'sanitize'     => 'wp_kses_post',
		'section'      => 'header_mobile_html2',
		'priority'     => 4,
		'default'      => thewebs()->default( 'header_mobile_html2_content' ),
		'partial'      => array(
			'selector'            => '.mobile-html2',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs_Pro\header_mobile_html2',
		),
		'input_attrs'  => array(
			'id' => 'header_mobile_html2',
		),
	),
	'header_mobile_html2_wpautop' => array(
		'control_type' => 'thewebs_switch_control',
		'section'      => 'header_mobile_html2',
		'default'      => thewebs()->default( 'header_mobile_html2_wpautop' ),
		'label'        => esc_html__( 'Automatically Add Paragraphs', 'thewebs-pro' ),
		'partial'      => array(
			'selector'            => '.mobile-html',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\header_mobile_html2',
		),
	),
	'header_mobile_html2_typography' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'header_mobile_html2_design',
		'label'        => esc_html__( 'Font', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'header_mobile_html2_typography' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.mobile-html2',
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
			'id' => 'header_mobile_html2_typography',
		),
	),
	'header_mobile_html2_link_style' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'header_mobile_html2_design',
		'default'      => thewebs()->default( 'header_mobile_html2_link_style' ),
		'label'        => esc_html__( 'Link Style', 'thewebs-pro' ),
		'input_attrs'  => array(
			'options' => array(
				'normal' => array(
					'name' => __( 'Underline', 'thewebs-pro' ),
				),
				'plain' => array(
					'name' => __( 'No Underline', 'thewebs-pro' ),
				),
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.mobile-html2',
				'pattern'  => 'inner-link-style-$',
				'key'      => '',
			),
		),
	),
	'header_mobile_html2_link_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_mobile_html2_design',
		'label'        => esc_html__( 'Link Colors', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'header_mobile_html2_link_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.mobile-html2 a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.mobile-html2 a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
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
			),
		),
	),
	'header_mobile_html2_margin' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'header_mobile_html2_design',
		'priority'     => 10,
		'default'      => thewebs()->default( 'header_mobile_html2_margin' ),
		'label'        => esc_html__( 'Margin', 'thewebs-pro' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.mobile-html2',
				'property' => 'margin',
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

