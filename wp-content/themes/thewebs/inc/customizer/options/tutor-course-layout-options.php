<?php
/**
 * Tutor Course Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'courses_layout_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'courses_layout',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'courses_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'courses_layout_design',
			),
			'active' => 'general',
		),
	),
	'courses_layout_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'courses_layout_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'courses_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'courses_layout_design',
			),
			'active' => 'design',
		),
	),
	'info_course_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'courses_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Course Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_course_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'courses_layout_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Course Title', 'thewebs' ),
		'settings'     => false,
	),
	'courses_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'courses_layout',
		'label'        => esc_html__( 'Course Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'courses_title_layout' ),
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
	'courses_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'courses_layout',
		'priority'     => 4,
		'default'      => thewebs()->default( 'courses_title_inner_layout' ),
		'label'        => esc_html__( 'Title Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.courses-hero-section',
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
	// 'courses_title_align' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'label'        => esc_html__( 'Course Title Align', 'thewebs' ),
	// 	'priority'     => 4,
	// 	'default'      => thewebs()->default( 'courses_title_align' ),
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'courses_title_layout',
	// 			'operator'   => '=',
	// 			'value'      => 'above',
	// 		),
	// 	),
	// 	'live_method'     => array(
	// 		array(
	// 			'type'     => 'class',
	// 			'selector' => '.courses-title',
	// 			'pattern'  => array(
	// 				'desktop' => 'title-align-$',
	// 				'tablet'  => 'title-tablet-align-$',
	// 				'mobile'  => 'title-mobile-align-$',
	// 			),
	// 			'key'      => '',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'left' => array(
	// 				'tooltip'  => __( 'Left Align Title', 'thewebs' ),
	// 				'dashicon' => 'editor-alignleft',
	// 			),
	// 			'center' => array(
	// 				'tooltip'  => __( 'Center Align Title', 'thewebs' ),
	// 				'dashicon' => 'editor-aligncenter',
	// 			),
	// 			'right' => array(
	// 				'tooltip'  => __( 'Right Align Title', 'thewebs' ),
	// 				'dashicon' => 'editor-alignright',
	// 			),
	// 		),
	// 		'responsive' => true,
	// 	),
	// ),
	'courses_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'courses_layout',
		'priority'     => 5,
		'label'        => esc_html__( 'Title Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .courses-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'courses_title_height' ),
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
	'courses_enroll_overlay' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'courses_layout',
		'default'      => thewebs()->default( 'courses_enroll_overlay' ),
		'label'        => esc_html__( 'Move sidebar up into header?', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-courses',
				'pattern'  => 'courses-sidebar-overlay-$',
				'key'      => '',
			),
		),
	),
	// 'courses_title_elements' => array(
	// 	'control_type' => 'thewebs_sorter_control',
	// 	'section'      => 'courses_layout',
	// 	'priority'     => 6,
	// 	'default'      => thewebs()->default( 'courses_title_elements' ),
	// 	'label'        => esc_html__( 'Title Elements', 'thewebs' ),
	// 	'transport'    => 'refresh',
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'courses_title_layout',
	// 			'operator'   => '=',
	// 			'value'      => 'above',
	// 		),
	// 	),
	// 	'settings'     => array(
	// 		'elements'   => 'courses_title_elements',
	// 		'title'      => 'courses_title_element_title',
	// 		'breadcrumb' => 'courses_title_element_breadcrumb',
	// 	),
	// 	'input_attrs'  => array(
	// 		'group' => 'courses_title_element',
	// 	),
	// ),
	'courses_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'courses_layout_design',
		'label'        => esc_html__( 'Course Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'course_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.tutor-single-course-lead-info h1.tutor-course-header-h1, .tutor-course-details-title .tutor-fs-4',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'             => 'courses_title_font',
			'headingInherit' => true,
		),
	),
	// 'courses_title_breadcrumb_color' => array(
	// 	'control_type' => 'thewebs_color_control',
	// 	'section'      => 'courses_layout_design',
	// 	'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
	// 	'default'      => thewebs()->default( 'courses_title_breadcrumb_color' ),
	// 	'live_method'     => array(
	// 		array(
	// 			'type'     => 'css',
	// 			'selector' => '.course-title .thewebs-breadcrumbs',
	// 			'property' => 'color',
	// 			'pattern'  => '$',
	// 			'key'      => 'color',
	// 		),
	// 		array(
	// 			'type'     => 'css',
	// 			'selector' => '.course-title .thewebs-breadcrumbs a:hover',
	// 			'property' => 'color',
	// 			'pattern'  => '$',
	// 			'key'      => 'hover',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'colors' => array(
	// 			'color' => array(
	// 				'tooltip' => __( 'Initial Color', 'thewebs' ),
	// 				'palette' => true,
	// 			),
	// 			'hover' => array(
	// 				'tooltip' => __( 'Link Hover Color', 'thewebs' ),
	// 				'palette' => true,
	// 			),
	// 		),
	// 	),
	// ),
	// 'courses_title_breadcrumb_font' => array(
	// 	'control_type' => 'thewebs_typography_control',
	// 	'section'      => 'courses_layout_design',
	// 	'label'        => esc_html__( 'Breadcrumb Font', 'thewebs' ),
	// 	'default'      => thewebs()->default( 'course_title_breadcrumb_font' ),
	// 	'live_method'     => array(
	// 		array(
	// 			'type'     => 'css_typography',
	// 			'selector' => '.courses-title .thewebs-breadcrumbs',
	// 			'property' => 'font',
	// 			'key'      => 'typography',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'id'      => 'course_title_breadcrumb_font',
	// 		'options' => 'no-color',
	// 	),
	// ),
	'courses_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'courses_layout_design',
		'label'        => esc_html__( 'Course Above Area Background', 'thewebs' ),
		'default'      => thewebs()->default( 'courses_title_background' ),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .courses-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Course Title Background', 'thewebs' ),
		),
	),
	'courses_title_featured_image' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'courses_layout_design',
		'default'      => thewebs()->default( 'courses_title_featured_image' ),
		'label'        => esc_html__( 'Use Featured Image for Background?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
	),
	'courses_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'courses_layout_design',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'courses_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.courses-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
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
	'courses_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'courses_layout_design',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'courses_title_border' ),
		'context'      => array(
			array(
				'setting'    => 'courses_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'course_title_top_border',
			'border_bottom' => 'course_title_bottom_border',
		),
		'live_method'     => array(
			'course_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.courses-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'course_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.courses-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_courses_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'courses_layout',
		'priority'     => 10,
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_courses_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'courses_layout_design',
		'priority'     => 10,
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'settings'     => false,
	),
	'courses_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'courses_layout',
		'label'        => esc_html__( 'Course Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'courses_layout' ),
		'input_attrs'  => array(
			'layout' => array(
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
			'class'      => 'thewebs-two-col',
		),
	),
	'courses_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'courses_layout',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'course_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-courses',
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
	'courses_vertical_padding' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'courses_layout',
		'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'courses_vertical_padding' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-courses',
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
	// 'course_feature' => array(
	// 	'control_type' => 'thewebs_switch_control',
	// 	'section'      => 'courses_layout',
	// 	'priority'     => 20,
	// 	'default'      => thewebs()->default( 'course_feature' ),
	// 	'label'        => esc_html__( 'Show Featured Image?', 'thewebs' ),
	// 	'transport'    => 'refresh',
	// ),
	// 'course_feature_position' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'label'        => esc_html__( 'Featured Image Position', 'thewebs' ),
	// 	'priority'     => 20,
	// 	'transport'    => 'refresh',
	// 	'default'      => thewebs()->default( 'course_feature_position' ),
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'course_feature',
	// 			'operator'   => '=',
	// 			'value'      => true,
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'above' => array(
	// 				'name' => __( 'Above', 'thewebs' ),
	// 			),
	// 			'behind' => array(
	// 				'name' => __( 'Behind', 'thewebs' ),
	// 			),
	// 			'below' => array(
	// 				'name' => __( 'Below', 'thewebs' ),
	// 			),
	// 		),
	// 		'responsive' => false,
	// 	),
	// ),
	// 'course_feature_ratio' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'label'        => esc_html__( 'Featured Image Ratio', 'thewebs' ),
	// 	'priority'     => 20,
	// 	'default'      => thewebs()->default( 'course_feature_ratio' ),
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'course_feature',
	// 			'operator'   => '=',
	// 			'value'      => true,
	// 		),
	// 	),
	// 	'live_method'     => array(
	// 		array(
	// 			'type'     => 'class',
	// 			'selector' => 'body.single-course .article-post-thumbnail',
	// 			'pattern'  => 'thewebs-thumbnail-ratio-$',
	// 			'key'      => '',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'inherit' => array(
	// 				'name' => __( 'Inherit', 'thewebs' ),
	// 			),
	// 			'1-1' => array(
	// 				'name' => __( '1:1', 'thewebs' ),
	// 			),
	// 			'3-4' => array(
	// 				'name' => __( '3:4', 'thewebs' ),
	// 			),
	// 			'2-3' => array(
	// 				'name' => __( '2:3', 'thewebs' ),
	// 			),
	// 			'9-16' => array(
	// 				'name' => __( '9:16', 'thewebs' ),
	// 			),
	// 			'1-2' => array(
	// 				'name' => __( '1:2', 'thewebs' ),
	// 			),
	// 		),
	// 		'responsive' => false,
	// 		'class' => 'thewebs-three-col-short',
	// 	),
	// ),
	// 'info_course_syllabus_layout' => array(
	// 	'control_type' => 'thewebs_title_control',
	// 	'section'      => 'courses_layout',
	// 	'priority'     => 20,
	// 	'label'        => esc_html__( 'Course Syllabus Layout', 'thewebs' ),
	// 	'settings'     => false,
	// ),
	// 'course_syllabus_columns' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'priority'     => 20,
	// 	'label'        => esc_html__( 'Course Syllabus Columns', 'thewebs' ),
	// 	'transport'    => 'refresh',
	// 	'default'      => thewebs()->default( 'course_syllabus_columns' ),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'1' => array(
	// 				'name' => __( '1', 'thewebs' ),
	// 			),
	// 			'2' => array(
	// 				'name' => __( '2', 'thewebs' ),
	// 			),
	// 			'3' => array(
	// 				'name' => __( '3', 'thewebs' ),
	// 			),
	// 		),
	// 		'responsive' => false,
	// 	),
	// ),
	// 'course_syllabus_lesson_style' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'label'        => esc_html__( 'Course Lesson Style', 'thewebs' ),
	// 	'priority'     => 20,
	// 	'transport'    => 'refresh',
	// 	'default'      => thewebs()->default( 'course_syllabus_lesson_style' ),
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'course_syllabus_columns',
	// 			'operator'   => '=',
	// 			'value'      => '1',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'standard' => array(
	// 				'name' => __( 'Standard', 'thewebs' ),
	// 			),
	// 			'tiles' => array(
	// 				'name' => __( 'Two Column Tiles', 'thewebs' ),
	// 			),
	// 			'center' => array(
	// 				'name' => __( 'One Column Center', 'thewebs' ),
	// 			),
	// 		),
	// 		'responsive' => false,
	// 		'class'      => 'thewebs-tiny-text',
	// 	),
	// ),
	// 'course_syllabus_thumbs' => array(
	// 	'control_type' => 'thewebs_switch_control',
	// 	'section'      => 'courses_layout',
	// 	'priority'     => 20,
	// 	'default'      => thewebs()->default( 'course_syllabus_thumbs' ),
	// 	'label'        => esc_html__( 'Show Lesson Thumbnail in Syllabus?', 'thewebs' ),
	// 	'transport'    => 'refresh',
	// ),
	// 'course_syllabus_thumbs_ratio' => array(
	// 	'control_type' => 'thewebs_radio_icon_control',
	// 	'section'      => 'courses_layout',
	// 	'label'        => esc_html__( 'Lesson Thumbnail Ratio', 'thewebs' ),
	// 	'priority'     => 20,
	// 	'default'      => thewebs()->default( 'course_syllabus_thumbs_ratio' ),
	// 	'context'      => array(
	// 		array(
	// 			'setting'    => 'course_syllabus_thumbs',
	// 			'operator'   => '=',
	// 			'value'      => true,
	// 		),
	// 	),
	// 	'live_method'     => array(
	// 		array(
	// 			'type'     => 'class',
	// 			'selector' => 'body.single-courses .llms-lesson-thumbnail',
	// 			'pattern'  => 'thewebs-thumbnail-ratio-$',
	// 			'key'      => '',
	// 		),
	// 	),
	// 	'input_attrs'  => array(
	// 		'layout' => array(
	// 			'inherit' => array(
	// 				'name' => __( 'Inherit', 'thewebs' ),
	// 			),
	// 			'1-1' => array(
	// 				'name' => __( '1:1', 'thewebs' ),
	// 			),
	// 			'3-4' => array(
	// 				'name' => __( '3:4', 'thewebs' ),
	// 			),
	// 			'2-3' => array(
	// 				'name' => __( '2:3', 'thewebs' ),
	// 			),
	// 			'9-16' => array(
	// 				'name' => __( '9:16', 'thewebs' ),
	// 			),
	// 			'1-2' => array(
	// 				'name' => __( '1:2', 'thewebs' ),
	// 			),
	// 		),
	// 		'responsive' => false,
	// 		'class' => 'thewebs-three-col-short',
	// 	),
	// ),
	'course_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'courses_layout_design',
		'priority'     => 20,
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'course_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.single-courses',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Course Background', 'thewebs' ),
		),
	),
	'course_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'courses_layout_design',
		'priority'     => 20,
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'course_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.single-courses .content-bg, body.single-courses:not(.content-style-unboxed) .tutor-price-preview-box, body.single-courses.content-style-unboxed .site',
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

