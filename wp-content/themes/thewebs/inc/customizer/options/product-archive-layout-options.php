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
	'product_archive_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'woocommerce_product_catalog',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'woocommerce_product_catalog',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'woocommerce_product_catalog_design',
			),
			'active' => 'general',
		),
	),
	'product_archive_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'woocommerce_product_catalog_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'woocommerce_product_catalog',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'woocommerce_product_catalog_design',
			),
			'active' => 'design',
		),
	),
	'info_product_archive_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_product_archive_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'woocommerce_product_catalog_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Archive Title', 'thewebs' ),
		'settings'     => false,
	),
	'product_archive_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 3,
		'default'      => thewebs()->default( 'product_archive_title' ),
		'label'        => esc_html__( 'Show Archive Title?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'product_archive_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'label'        => esc_html__( 'Archive Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'product_archive_title_layout' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
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
	'product_archive_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 4,
		'default'      => thewebs()->default( 'product_archive_title_inner_layout' ),
		'label'        => esc_html__( 'Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'product_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.product-archive-hero-section',
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
	'product_archive_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'label'        => esc_html__( 'Product Archive Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'product_archive_title_align' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.product-archive-title',
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
	'product_archive_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 5,
		'label'        => esc_html__( 'Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'product_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .product-archive-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'product_archive_title_height' ),
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
	'product_archive_title_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 6,
		'default'      => thewebs()->default( 'product_archive_title_elements' ),
		'label'        => esc_html__( 'Title Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'    => 'product_archive_title_elements',
			'title'       => 'product_archive_title_element_title',
			'breadcrumb'  => 'product_archive_title_element_breadcrumb',
			'description' => 'product_archive_title_element_description',
		),
	),
	'product_archive_title_heading_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_heading_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.product-archive-title h1',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'      => 'product_archive_title_heading_font',
			'options' => 'no-color',
		),
	),
	'product_archive_title_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Title Color', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.product-archive-title h1',
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
	'product_archive_title_description_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Description Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_description_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.product-archive-title .archive-description',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.product-archive-title .archive-description a:hover',
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
	'product_archive_title_breadcrumb_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_breadcrumb_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.product-archive-title .thewebs-breadcrumbs',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.product-archive-title .thewebs-breadcrumbs a:hover',
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
	'product_archive_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Archive Title Background', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_background' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'product_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .product-archive-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Product Archive Title Background', 'thewebs' ),
		),
	),
	'product_archive_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.product-archive-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'product_archive_title_layout',
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
	'product_archive_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_border' ),
		'context'      => array(
			array(
				'setting'    => 'product_archive_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'product_archive_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'product_archive_title_top_border',
			'border_bottom' => 'product_archive_title_bottom_border',
		),
		'live_method'     => array(
			'product_archive_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.product-archive-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'product_archive_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.product-archive-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_product_archive_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'info_product_archive_layout_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'woocommerce_product_catalog_design',
		'priority'     => 10,
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'settings'     => false,
	),
	'product_archive_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_layout' ),
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
	'product_archive_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'woocommerce_product_catalog',
		'label'        => esc_html__( 'Product Archive Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'product_archive_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.post-type-archive-product',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
			array(
				'type'     => 'class',
				'selector' => 'body.tax-product_cat',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
			array(
				'type'     => 'class',
				'selector' => 'body.tax-product_tag',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'tooltip' => __( 'Boxed', 'thewebs' ),
					'icon'    => 'gridBoxed',
				),
				'unboxed' => array(
					'tooltip' => __( 'Unboxed', 'thewebs' ),
					'icon'    => 'gridUnboxed',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'product_archive_show_results_count' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_show_results_count' ),
		'label'        => esc_html__( 'Show Archive Results Count?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'product_archive_show_order' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_show_order' ),
		'label'        => esc_html__( 'Show Archive Sorting Dropdown?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'product_archive_toggle' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_toggle' ),
		'label'        => esc_html__( 'Show Archive Grid/List Toggle?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'product_archive_image_hover_switch' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'transport'    => 'refresh',
		'label'        => esc_html__( 'Product Image Hover Switch', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_image_hover_switch' ),
		'input_attrs'  => array(
			'layout' => array(
				'none' => array(
					'tooltip' => __( 'None', 'thewebs' ),
					'name' => __( 'None', 'thewebs' ),
				),
				'fade' => array(
					'tooltip' => __( 'Fade to second image', 'thewebs' ),
					'name' => __( 'Fade', 'thewebs' ),
				),
				'slide' => array(
					'tooltip' => __( 'Slide to second image', 'thewebs' ),
					'name' => __( 'Slide', 'thewebs' ),
				),
				'zoom' => array(
					'tooltip' => __( 'Zoom into second image', 'thewebs' ),
					'name' => __( 'Zoom', 'thewebs' ),
				),
				'flip' => array(
					'tooltip' => __( 'Flip to second image', 'thewebs' ),
					'name' => __( 'Flip', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-three-col thewebs-auto-height',
		),
	),
	'product_archive_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'transport'    => 'refresh',
		'label'        => esc_html__( 'Button Action Style', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_style' ),
		'input_attrs'  => array(
			'layout' => array(
				'action-on-hover' => array(
					'tooltip' => __( 'Slide up on hover', 'thewebs' ),
					'name' => __( 'Bottom Slide Up', 'thewebs' ),
				),
				'action-visible' => array(
					'tooltip' => __( 'On the Bottom Always Visible', 'thewebs' ),
					'name' => __( 'Always Visible', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-tiny-text',
		),
	),
	'product_archive_button_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'transport'    => 'refresh',
		'label'        => esc_html__( 'Button Style', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_style' ),
		'input_attrs'  => array(
			'layout' => array(
				'text' => array(
					'tooltip' => __( 'Bold text with arrow icon.', 'thewebs' ),
					'name' => __( 'Text with Arrow', 'thewebs' ),
				),
				'button' => array(
					'tooltip' => __( 'Show as standard button', 'thewebs' ),
					'name' => __( 'Button', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-tiny-text',
		),
	),
	'product_archive_button_align' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 7,
		'default'      => thewebs()->default( 'product_archive_button_align' ),
		'label'        => esc_html__( 'Align Button at Bottom?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'product_archive_mobile_columns' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'woocommerce_product_catalog',
		'priority'     => 15,
		'transport'    => 'refresh',
		'label'        => esc_html__( 'Mobile Columns Layout', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_mobile_columns' ),
		'input_attrs'  => array(
			'layout' => array(
				'default' => array(
					'tooltip' => '',
					'name' => __( 'One Column', 'thewebs' ),
				),
				'twocolumn' => array(
					'tooltip' => '',
					'name' => __( 'Two Columns', 'thewebs' ),
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-tiny-text',
		),
	),
	'product_archive_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.woocommerce ul.products li.product h3, .woocommerce ul.products li.product .product-details .woocommerce-loop-product__title, .woocommerce ul.products li.product .product-details .woocommerce-loop-category__title, .wc-block-grid__products .wc-block-grid__product .wc-block-grid__product-title',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'             => 'product_archive_title_font',
		),
	),
	'product_archive_price_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Price Font', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_price_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.woocommerce ul.products li.product .product-details .price',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'input_attrs'  => array(
			'id'             => 'product_archive_price_font',
		),
	),
	'product_archive_button_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button):hover, .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button):hover, .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
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
	'product_archive_button_background' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Background Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button):hover, .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button):hover, .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
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
	'product_archive_button_border_colors' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Border Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_border' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button):hover, .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button):hover, .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link:hover',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
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
	'product_archive_button_border' => array(
		'control_type' => 'thewebs_border_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Border', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_border' ),
		'live_method'     => array(
			array(
				'type'     => 'css_border',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'border',
				'pattern'  => '$',
				'key'      => 'border',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
			),
		),
		'input_attrs'  => array(
			'responsive' => false,
			'color'      => false,
		),
	),
	'product_archive_button_radius' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'woocommerce_product_catalog_design',
		'priority'     => 10,
		'default'      => thewebs()->default( 'product_archive_button_radius' ),
		'label'        => esc_html__( 'Product Archive Button Border Radius', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'border-radius',
				'pattern'  => '$',
				'key'      => 'measure',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
			),
		),
		'input_attrs'  => array(
			'responsive' => false,
		),
	),
	'product_archive_button_typography' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Font', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_button_typography' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'pattern'  => array(
					'desktop' => '$',
					'tablet'  => '$',
					'mobile'  => '$',
				),
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
			),
		),
		'input_attrs'  => array(
			'id' => 'header_button_typography',
			'options' => 'no-color',
		),
	),
	'product_archive_button_shadow' => array(
		'control_type' => 'thewebs_shadow_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Shadow', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'css_boxshadow',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button), .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button), .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link',
				'property' => 'box-shadow',
				'pattern'  => '$',
				'key'      => '',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
			),
		),
		'default'      => thewebs()->default( 'product_archive_button_shadow' ),
	),
	'product_archive_button_shadow_hover' => array(
		'control_type' => 'thewebs_shadow_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Product Archive Button Hover State Shadow', 'thewebs' ),
		'live_method'     => array(
			array(
				'type'     => 'css_boxshadow',
				'selector' => '.woocommerce ul.products.woo-archive-btn-button .product-action-wrap .button:not(.kb-button):hover, .woocommerce ul.products li.woo-archive-btn-button .button:not(.kb-button):hover, .wc-block-grid__product.woo-archive-btn-button .product-details .wc-block-grid__product-add-to-cart .wp-block-button__link:hover',
				'property' => 'box-shadow',
				'pattern'  => '$',
				'key'      => '',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'product_archive_button_style',
				'operator'   => '=',
				'value'      => 'button',
			),
		),
		'default'      => thewebs()->default( 'product_archive_button_shadow_hover' ),
	),
	'product_archive_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.post-type-archive-product, body.tax-product_cat, body.tax-product_tag',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Product Archive Background', 'thewebs' ),
		),
	),
	'product_archive_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'woocommerce_product_catalog_design',
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'product_archive_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.post-type-archive-product .content-bg, body.tax-product_cat .content-bg, body.tax-product_tag .content-bg, body.tax-product_cat.content-style-unboxed .site, body.tax-product_tag.content-style-unboxed .site, body.post-type-archive-product.content-style-unboxed .site',
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

