<?php
/**
 * Header Main Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'course_archive_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'course_archive',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'course_archive',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'course_archive_design',
			),
			'active' => 'general',
		),
	),
	'course_archive_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'course_archive_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'course_archive',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'course_archive_design',
			),
			'active' => 'design',
		),
	),
	'info_course_archive_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'course_archive',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_course_archive_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'course_archive_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'course_archive_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'course_archive',
		'priority'     => 3,
		'default'      => thewebs()->default( 'course_archive_title' ),
		'label'        => esc_html__( 'Show Archive Title?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'course_archive_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'label'        => esc_html__( 'Archive Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'course_archive_title_layout' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
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
	'course_archive_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'priority'     => 4,
		'default'      => thewebs()->default( 'course_archive_title_inner_layout' ),
		'label'        => esc_html__( 'Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'course_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.course-archive-hero-section',
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
	'course_archive_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'label'        => esc_html__( 'Course Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'course_archive_title_align' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.course-archive-title',
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
	'course_archive_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'course_archive',
		'priority'     => 5,
		'label'        => esc_html__( 'Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'course_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .course-archive-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'course_archive_title_height' ),
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
	'course_archive_title_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'course_archive',
		'priority'     => 6,
		'default'      => thewebs()->default( 'course_archive_title_elements' ),
		'label'        => esc_html__( 'Title Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'    => 'course_archive_title_elements',
			'title'       => 'course_archive_title_element_title',
			'breadcrumb'  => 'course_archive_title_element_breadcrumb',
			'description' => 'course_archive_title_element_description',
		),
	),
	'course_archive_title_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Title Color', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.course-archive-title h1',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Color', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'course_archive_title_description_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Description Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_description_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.course-archive-title .archive-description',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.course-archive-title .archive-description a:hover',
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
	'course_archive_title_breadcrumb_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_breadcrumb_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.course-archive-title .thewebs-breadcrumbs',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.course-archive-title .thewebs-breadcrumbs a:hover',
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
	'course_archive_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Archive Title Background', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_background' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'course_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .course-archive-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Course Archive Title Background', 'thewebs' ),
		),
	),
	'course_archive_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.course-archive-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'course_archive_title_layout',
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
	'course_archive_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_title_border' ),
		'context'      => array(
			array(
				'setting'    => 'course_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'course_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'course_archive_title_top_border',
			'border_bottom' => 'course_archive_title_bottom_border',
		),
		'live_method'     => array(
			'course_archive_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.course-archive-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'course_archive_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.course-archive-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_course_archive_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'course_archive',
		'priority'     => 10,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_course_archive_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'course_archive_design',
		'priority'     => 10,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'course_archive_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'course_archive_layout' ),
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
			'class'      => 'thewebs-three-col',
			'responsive' => false,
		),
	),
	'course_archive_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'course_archive_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.post-type-archive-course',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
			array(
				'type'     => 'class',
				'selector' => 'body.tax-course_cat',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'tooltip' => __( 'Boxed', 'thewebs' ),
					'icon' => 'gridBoxed',
				),
				'unboxed' => array(
					'tooltip' => __( 'Unboxed', 'thewebs' ),
					'icon' => 'gridUnboxed',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'course_archive_columns' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'course_archive',
		'priority'     => 20,
		'label'        => esc_html__( 'Course Archive Columns', 'thewebs' ),
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'course_archive_columns' ),
		'input_attrs'  => array(
			'layout' => array(
				'2' => array(
					'name' => __( '2', 'thewebs' ),
				),
				'3' => array(
					'name' => __( '3', 'thewebs' ),
				),
				'4' => array(
					'name' => __( '4', 'thewebs' ),
				),
			),
			'responsive' => false,
		),
	),
	'course_archive_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.post-type-archive-course, body.tax-course_cat',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Course Archive Background', 'thewebs' ),
		),
	),
	'course_archive_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'course_archive_design',
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'course_archive_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.post-type-archive-course .content-bg, body.tax-course_cat .content-bg, body.tax-course_cat.content-style-unboxed .site, body.post-type-archive-course.content-style-unboxed .site',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Archive Content Background', 'thewebs' ),
		),
	),
);

Theme_Customizer::add_settings( $settings );

