<?php
/**
 * Course Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'sfwd_courses_layout_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_courses_layout',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_courses_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_courses_layout_design',
			),
			'active' => 'general',
		),
	),
	'sfwd_courses_layout_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_courses_layout_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_courses_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_courses_layout_design',
			),
			'active' => 'design',
		),
	),
	'info_sfwd-courses_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Course Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_sfwd-courses_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_courses_layout_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Course Title', 'thewebs' ),
		'settings'     => false,
	),
	'sfwd-courses_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'sfwd-courses_title' ),
		'label'        => esc_html__( 'Show Course Title?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'sfwd-courses_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Course Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'sfwd-courses_title_layout' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'normal' => array(
					'tooltip' => __( 'In Content', 'thewebs' ),
					'icon'    => 'incontent',
				),
				'above' => array(
					'tooltip' => __( 'Above Content', 'thewebs' ),
					'icon'    => 'abovecontent',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'sfwd-courses_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 4,
		'default'      => thewebs()->default( 'sfwd-courses_title_inner_layout' ),
		'label'        => esc_html__( 'Title Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.sfwd-courses-hero-section',
				'pattern'  => 'entry-hero-layout-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'standard' => array(
					'tooltip' => __( 'Background Fullwidth, Content Contained', 'thewebs' ),
					'name'    => __( 'Standard', 'thewebs' ),
					'icon'    => '',
				),
				'fullwidth' => array(
					'tooltip' => __( 'Background & Content Fullwidth', 'thewebs' ),
					'name'    => __( 'Fullwidth', 'thewebs' ),
					'icon'    => '',
				),
				'contained' => array(
					'tooltip' => __( 'Background & Content Contained', 'thewebs' ),
					'name'    => __( 'Contained', 'thewebs' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'sfwd-courses_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Course Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'sfwd-courses_title_align' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.sfwd-courses-title',
				'pattern'  => array(
					'desktop' => 'title-align-$',
					'tablet'  => 'title-tablet-align-$',
					'mobile'  => 'title-mobile-align-$',
				),
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'left' => array(
					'tooltip'  => __( 'Left Align Title', 'thewebs' ),
					'dashicon' => 'editor-alignleft',
				),
				'center' => array(
					'tooltip'  => __( 'Center Align Title', 'thewebs' ),
					'dashicon' => 'editor-aligncenter',
				),
				'right' => array(
					'tooltip'  => __( 'Right Align Title', 'thewebs' ),
					'dashicon' => 'editor-alignright',
				),
			),
			'responsive' => true,
		),
	),
	'sfwd-courses_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 5,
		'label'        => esc_html__( 'Title Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .sfwd-courses-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'sfwd-courses_title_height' ),
		'input_attrs'  => array(
			'min'     => array(
				'px'  => 10,
				'em'  => 1,
				'rem' => 1,
				'vh'  => 2,
			),
			'max'     => array(
				'px'  => 800,
				'em'  => 12,
				'rem' => 12,
				'vh'  => 100,
			),
			'step'    => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
				'vh'  => 1,
			),
			'units'   => array( 'px', 'em', 'rem', 'vh' ),
		),
	),
	'sfwd-courses_title_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 6,
		'default'      => thewebs()->default( 'sfwd-courses_title_elements' ),
		'label'        => esc_html__( 'Title Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'    => 'sfwd-courses_title_elements',
			'title' => 'sfwd-courses_title_element_title',
			'breadcrumb'  => 'sfwd-courses_title_element_breadcrumb',
		),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'group' => 'sfwd-courses_title_element',
		),
	),
	'sfwd-courses_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Course Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.sfwd-courses-title h1',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'id'             => 'sfwd-courses_title_font',
			'headingInherit' => true,
		),
	),
	'sfwd-courses_title_breadcrumb_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_breadcrumb_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.sfwd-courses-title .thewebs-breadcrumbs',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.sfwd-courses-title .thewebs-breadcrumbs a:hover',
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
					'tooltip' => __( 'Link Hover Color', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'sfwd-courses_title_breadcrumb_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Breadcrumb Font', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_breadcrumb_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.sfwd-courses-title .thewebs-breadcrumbs',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'      => 'sfwd-courses_title_breadcrumb_font',
			'options' => 'no-color',
		),
	),
	'sfwd-courses_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Course Above Area Background', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_background' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .sfwd-courses-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Course Title Background', 'thewebs' ),
		),
	),
	'sfwd-courses_title_featured_image' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'sfwd_courses_layout_design',
		'default'      => thewebs()->default( 'sfwd-courses_title_featured_image' ),
		'label'        => esc_html__( 'Use Featured Image for Background?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
	),
	'sfwd-courses_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.sfwd-courses-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Overlay Color', 'thewebs' ),
					'palette' => true,
				),
			),
			'allowGradient' => true,
		),
	),
	'sfwd-courses_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'sfwd_courses_layout_design',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_title_border' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'sfwd-courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'sfwd-courses_title_top_border',
			'border_bottom' => 'sfwd-courses_title_bottom_border',
		),
		'live_method'     => array(
			'sfwd-courses_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.sfwd-courses-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'sfwd-courses_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.sfwd-courses-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_sfwd_courses_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 10,
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_sfwd_courses_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_courses_layout_design',
		'priority'     => 10,
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'settings'     => false,
	),
	'sfwd-courses_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'sfwd-courses_layout' ),
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
			'responsive' => false,
			'class'      => 'thewebs-three-col',
		),
	),
	'sfwd-courses_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Course Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'sfwd-courses_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'sfwd-courses_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'sfwd-courses_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-sfwd-courses',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'tooltip' => __( 'Boxed', 'thewebs' ),
					'icon' => 'boxed',
				),
				'unboxed' => array(
					'tooltip' => __( 'Unboxed', 'thewebs' ),
					'icon' => 'narrow',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'sfwd-courses_vertical_padding' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'sfwd-courses_vertical_padding' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-sfwd-courses',
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
	'sfwd-courses_feature' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'sfwd_courses_layout',
		'priority'     => 20,
		'default'      => thewebs()->default( 'sfwd-courses_feature' ),
		'label'        => esc_html__( 'Show Featured Image?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'sfwd-courses_feature_position' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Featured Image Position', 'thewebs' ),
		'priority'     => 20,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'sfwd-courses_feature_position' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_feature',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'above' => array(
					'name' => __( 'Above', 'thewebs' ),
				),
				'behind' => array(
					'name' => __( 'Behind', 'thewebs' ),
				),
				'below' => array(
					'name' => __( 'Below', 'thewebs' ),
				),
			),
			'responsive' => false,
		),
	),
	'sfwd-courses_feature_ratio' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_courses_layout',
		'label'        => esc_html__( 'Featured Image Ratio', 'thewebs' ),
		'priority'     => 20,
		'default'      => thewebs()->default( 'sfwd-courses_feature_ratio' ),
		'context'      => array(
			array(
				'setting'    => 'sfwd-courses_feature',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-sfwd-courses .article-post-thumbnail',
				'pattern'  => 'thewebs-thumbnail-ratio-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'inherit' => array(
					'name' => __( 'Inherit', 'thewebs' ),
				),
				'1-1' => array(
					'name' => __( '1:1', 'thewebs' ),
				),
				'3-4' => array(
					'name' => __( '4:3', 'thewebs' ),
				),
				'2-3' => array(
					'name' => __( '3:2', 'thewebs' ),
				),
				'9-16' => array(
					'name' => __( '16:9', 'thewebs' ),
				),
				'1-2' => array(
					'name' => __( '2:1', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class' => 'thewebs-three-col-short',
		),
	),
	'sfwd-courses_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'sfwd_courses_layout_design',
		'priority'     => 20,
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.single-sfwd-courses',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Course Background', 'thewebs' ),
		),
	),
	'sfwd-courses_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'sfwd_courses_layout_design',
		'priority'     => 20,
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-courses_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.single-sfwd-courses .content-bg, body.single-sfwd-courses.content-style-unboxed .site',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Course Content Background', 'thewebs' ),
		),
	),
);

Theme_Customizer::add_settings( $settings );

