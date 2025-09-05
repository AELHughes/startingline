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
	'post_archive_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'post_archive',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'post_archive',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'post_archive_design',
			),
			'active' => 'general',
		),
	),
	'post_archive_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'post_archive_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'post_archive',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'post_archive_design',
			),
			'active' => 'design',
		),
	),
	'info_post_archive_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'post_archive',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_post_archive_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'post_archive_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'post_archive_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'post_archive',
		'priority'     => 3,
		'default'      => thewebs()->default( 'post_archive_title' ),
		'label'        => esc_html__( 'Show Archive Title?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'post_archive_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Archive Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'post_archive_title_layout' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'normal' => array(
					'name' => __( 'In Content', 'thewebs' ),
					'icon'    => 'incontent',
				),
				'above' => array(
					'name' => __( 'Above Content', 'thewebs' ),
					'icon'    => 'abovecontent',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'post_archive_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'priority'     => 4,
		'default'      => thewebs()->default( 'post_archive_title_inner_layout' ),
		'label'        => esc_html__( 'Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'post_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.post-archive-hero-section',
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
	'post_archive_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Post Archive Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'post_archive_title_align' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.post-archive-title',
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
	'post_archive_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'post_archive',
		'priority'     => 5,
		'label'        => esc_html__( 'Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'post_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .post-archive-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'post_archive_title_height' ),
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
	'post_archive_title_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'post_archive',
		'priority'     => 6,
		'default'      => thewebs()->default( 'post_archive_title_elements' ),
		'label'        => esc_html__( 'Title Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'    => 'post_archive_title_elements',
			'title'       => 'post_archive_title_element_title',
			'breadcrumb'  => 'post_archive_title_element_breadcrumb',
			'description' => 'post_archive_title_element_description',
		),
	),
	'post_archive_title_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Title Color', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.wp-site-blocks .post-archive-title h1',
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
	'post_archive_title_description_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Description Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_description_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.post-archive-title .archive-description',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.post-archive-title .archive-description a:hover',
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
	'post_archive_title_breadcrumb_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_breadcrumb_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.post-archive-title .thewebs-breadcrumbs',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.post-archive-title .thewebs-breadcrumbs a:hover',
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
	'post_archive_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Archive Title Background', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_background' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'post_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .post-archive-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Post Title Background', 'thewebs' ),
		),
	),
	'post_archive_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.post-archive-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'post_archive_title_layout',
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
	'post_archive_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_title_border' ),
		'context'      => array(
			array(
				'setting'    => 'post_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'post_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'post_archive_title_top_border',
			'border_bottom' => 'post_archive_title_bottom_border',
		),
		'live_method'     => array(
			'post_archive_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.post-archive-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'post_archive_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.post-archive-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_post_archive_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'post_archive',
		'priority'     => 10,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_post_archive_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'post_archive_design',
		'priority'     => 10,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'post_archive_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'post_archive_layout' ),
		'input_attrs'  => array(
			'layout' => array(
				'normal' => array(
					'name' => __( 'Normal', 'thewebs' ),
					'icon' => 'normal',
				),
				'narrow' => array(
					'name' => __( 'Narrow', 'thewebs' ),
					'icon' => 'narrow',
				),
				'fullwidth' => array(
					'name' => __( 'Fullwidth', 'thewebs' ),
					'icon' => 'fullwidth',
				),
				'left' => array(
					'name' => __( 'Left Sidebar', 'thewebs' ),
					'icon' => 'leftsidebar',
				),
				'right' => array(
					'name' => __( 'Right Sidebar', 'thewebs' ),
					'icon' => 'rightsidebar',
				),
			),
			'class'      => 'thewebs-three-col',
			'responsive' => false,
		),
	),
	'post_archive_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Post Archive Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'post_archive_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'post_archive_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'post_archive_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.archive',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
			array(
				'type'     => 'class',
				'selector' => 'body.blog',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'tooltip' => __( 'Boxed', 'thewebs' ),
					'icon' => 'gridBoxed',
					'name' => __( 'Boxed', 'thewebs' ),
				),
				'unboxed' => array(
					'tooltip' => __( 'Unboxed', 'thewebs' ),
					'icon' => 'gridUnboxed',
					'name' => __( 'Unboxed', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'post_archive_columns' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'priority'     => 10,
		'label'        => esc_html__( 'Post Archive Columns', 'thewebs' ),
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'post_archive_columns' ),
		'input_attrs'  => array(
			'layout' => array(
				'1' => array(
					'name' => __( '1', 'thewebs' ),
				),
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
	'post_archive_item_image_placement' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Item Image Placement', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'post_archive_item_image_placement' ),
		'context'      => array(
			array(
				'setting' => 'post_archive_columns',
				'operator'   => '=',
				'value'   => '1',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.post-archive.grid-cols',
				'pattern'  => 'item-image-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'beside' => array(
					'name' => __( 'Beside', 'thewebs' ),
				),
				'above' => array(
					'name' => __( 'Above', 'thewebs' ),
				),
			),
			'responsive' => false,
		),
	),
	'post_archive_item_vertical_alignment' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'post_archive',
		'label'        => esc_html__( 'Content Vertical Alignment', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'post_archive_item_vertical_alignment' ),
		'context'      => array(
			array(
				'setting' => 'post_archive_columns',
				'operator'   => '=',
				'value'   => '1',
			),
			array(
				'setting' => 'post_archive_item_image_placement',
				'operator'   => '=',
				'value'   => 'beside',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.post-archive.grid-cols',
				'pattern'  => 'item-content-vertical-align-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'top' => array(
					'name' => __( 'Top', 'thewebs' ),
				),
				'center' => array(
					'name' => __( 'Center', 'thewebs' ),
				),
			),
			'responsive' => false,
		),
	),
	'info_post_archive_item_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'post_archive',
		'priority'     => 12,
		'label'        => esc_html__( 'Post Item Layout', 'thewebs' ),
		'settings'     => false,
	),
	'post_archive_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'post_archive',
		'priority'     => 12,
		'default'      => thewebs()->default( 'post_archive_elements' ),
		'label'        => esc_html__( 'Post Item Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'   => 'post_archive_elements',
			'feature'    => 'post_archive_element_feature',
			'categories' => 'post_archive_element_categories',
			'title'      => 'post_archive_element_title',
			'meta'       => 'post_archive_element_meta',
			'excerpt'    => 'post_archive_element_excerpt',
			'readmore'   => 'post_archive_element_readmore',
		),
		'input_attrs'  => array(
			'groupe'   => 'post_archive_elements',
			'sortable' => false,
			'defaults' => array(
				'feature'    => thewebs()->default( 'post_archive_element_feature' ),
				'categories' => thewebs()->default( 'post_archive_element_categories' ),
				'title'      => thewebs()->default( 'post_archive_element_title' ),
				'meta'       => thewebs()->default( 'post_archive_element_meta' ),
				'excerpt'    => thewebs()->default( 'post_archive_element_excerpt' ),
				'readmore'   => thewebs()->default( 'post_archive_element_readmore' ),
			),
			'dividers' => array(
				'dot' => array(
					'icon' => 'dot',
				),
				'slash' => array(
					'icon' => 'slash',
				),
				'dash' => array(
					'icon' => 'dash',
				),
				'vline' => array(
					'icon' => 'vline',
				),
				'customicon' => array(
					'icon' => 'hours',
				),
			),
		),
	),
	'post_archive_item_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Post Item Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_item_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.loop-entry.type-post h2.entry-title',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'             => 'post_archive_item_title_font',
			'headingInherit' => true,
		),
	),
	'post_archive_item_category_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Item Category Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_item_category_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-taxonomies, .loop-entry.type-post .entry-taxonomies a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-taxonomies a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-taxonomies .category-style-pill a',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-taxonomies .category-style-pill a:hover',
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
					'tooltip' => __( 'Link Hover Color', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'post_archive_item_category_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Item Category Font', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_item_category_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.loop-entry.type-post .entry-taxonomies',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'      => 'post_archive_item_category_font',
			'options' => 'no-color',
		),
	),
	'post_archive_item_meta_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Item Meta Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_item_meta_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-meta',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.loop-entry.type-post .entry-meta a:hover',
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
	'post_archive_item_meta_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Item Meta Font', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_item_meta_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.loop-entry.type-post .entry-meta',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'      => 'post_archive_item_meta_font',
			'options' => 'no-color',
		),
	),
	'post_archive_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.archive, body.blog',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Post Background', 'thewebs' ),
		),
	),
	'post_archive_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'post_archive_design',
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'post_archive_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.blog .content-bg, body.archive .content-bg, body.archive.content-style-unboxed .site, body.blog.content-style-unboxed .site',
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

