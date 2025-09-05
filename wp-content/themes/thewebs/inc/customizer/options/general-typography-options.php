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
		// 'load_font_pairing' => array(
		// 	'control_type' => 'thewebs_font_pairing',
		// 	'section'      => 'general_typography',
		// 	'label'        => esc_html__( 'Font Pairings', 'thewebs' ),
		// 	'settings'     => false,
		// ),
		'base_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'Base Font', 'thewebs' ),
			'default'      => thewebs()->default( 'base_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'body',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'         => 'base_font',
				'canInherit' => false,
			),
		),
		'load_base_italic' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_typography',
			'default'      => thewebs()->default( 'load_base_italic' ),
			'label'        => esc_html__( 'Load Italics Font Styles', 'thewebs' ),
			'context'      => array(
				array(
					'setting' => 'base_font',
					'operator'   => 'load_italic',
					'value'   => 'true',
				),
			),
		),
		'info_heading' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'Headings', 'thewebs' ),
			'settings'     => false,
		),
		'heading_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'Heading Font Family', 'thewebs' ),
			'default'      => thewebs()->default( 'heading_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h1,h2,h3,h4,h5,h6',
					'property' => 'font',
					'key'      => 'family',
				),
			),
			'input_attrs'  => array(
				'id'      => 'heading_font',
				'options' => 'family',
			),
		),
		'h1_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H1 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h1_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h1',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h1_font',
				'headingInherit' => true,
			),
		),
		'h2_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H2 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h2_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h2',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h2_font',
				'headingInherit' => true,
			),
		),
		'h3_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H3 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h3_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h3',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h3_font',
				'headingInherit' => true,
			),
		),
		'h4_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H4 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h4_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h4',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h4_font',
				'headingInherit' => true,
			),
		),
		'h5_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H5 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h5_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h5',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h5_font',
				'headingInherit' => true,
			),
		),
		'h6_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H6 Font', 'thewebs' ),
			'default'      => thewebs()->default( 'h6_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => 'h6',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'h6_font',
				'headingInherit' => true,
			),
		),
		'info_above_title_heading' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'Title Above Content', 'thewebs' ),
			'settings'     => false,
		),
		'title_above_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'H1 Title', 'thewebs' ),
			'default'      => thewebs()->default( 'title_above_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.entry-hero h1',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'             => 'title_above_font',
				'headingInherit' => true,
			),
		),
		'title_above_breadcrumb_font' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'general_typography',
			'label'        => esc_html__( 'Breadcrumbs', 'thewebs' ),
			'default'      => thewebs()->default( 'title_above_breadcrumb_font' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.entry-hero .thewebs-breadcrumbs',
					'property' => 'font',
					'key'      => 'typography',
				),
			),
			'input_attrs'  => array(
				'id'      => 'title_above_breadcrumb_font',
			),
		),
		'font_rendering' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_typography',
			'transport'    => 'refresh',
			'default'      => thewebs()->default( 'font_rendering' ),
			'label'        => esc_html__( 'Enable Font Smoothing', 'thewebs' ),
		),
		'google_subsets' => array(
			'control_type' => 'thewebs_check_icon_control',
			'section'      => 'general_typography',
			'sanitize'     => 'thewebs_sanitize_google_subsets',
			'priority'     => 20,
			'default'      => array(),
			'label'        => esc_html__( 'Google Font Subsets', 'thewebs' ),
			'input_attrs'  => array(
				'options' => array(
					'latin-ext' => array(
						'name' => __( 'Latin Extended', 'thewebs' ),
					),
					'cyrillic' => array(
						'name' => __( 'Cyrillic', 'thewebs' ),
					),
					'cyrillic-ext' => array(
						'name' => __( 'Cyrillic Extended', 'thewebs' ),
					),
					'greek' => array(
						'name' => __( 'Greek', 'thewebs' ),
					),
					'greek-ext' => array(
						'name' => __( 'Greek Extended', 'thewebs' ),
					),
					'vietnamese' => array(
						'name' => __( 'Vietnamese', 'thewebs' ),
					),
					'arabic' => array(
						'name' => __( 'Arabic', 'thewebs' ),
					),
					'khmer' => array(
						'name' => __( 'Khmer', 'thewebs' ),
					),
					'chinese' => array(
						'name' => __( 'Chinese', 'thewebs' ),
					),
					'chinese-simplified' => array(
						'name' => __( 'Chinese Simplified', 'thewebs' ),
					),
					'tamil' => array(
						'name' => __( 'Tamil', 'thewebs' ),
					),
					'bengali' => array(
						'name' => __( 'Bengali', 'thewebs' ),
					),
					'devanagari' => array(
						'name' => __( 'Devanagari', 'thewebs' ),
					),
					'hebrew' => array(
						'name' => __( 'Hebrew', 'thewebs' ),
					),
					'korean' => array(
						'name' => __( 'Korean', 'thewebs' ),
					),
					'thai' => array(
						'name' => __( 'Thai', 'thewebs' ),
					),
					'telugu' => array(
						'name' => __( 'Telugu', 'thewebs' ),
					),
				),
			),
		),
	)
);
