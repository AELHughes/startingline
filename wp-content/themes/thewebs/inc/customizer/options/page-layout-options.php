<?php
/**
 * Header Main Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

ob_start(); ?>
<div class="thewebs-compontent-tabs nav-tab-wrapper wp-clearfix">
	<a href="#" class="nav-tab thewebs-general-tab thewebs-compontent-tabs-button nav-tab-active" data-tab="general">
		<span><?php esc_html_e( 'General', 'thewebs' ); ?></span>
	</a>
	<a href="#" class="nav-tab thewebs-design-tab thewebs-compontent-tabs-button" data-tab="design">
		<span><?php esc_html_e( 'Design', 'thewebs' ); ?></span>
	</a>
</div>
<?php
$compontent_tabs = ob_get_clean();
$settings = array(
	'page_layout_tabs' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'page_layout',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_tabs,
	),
	'info_page_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'page_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Page Title', 'thewebs' ),
		'settings'     => false,
	),
	'page_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'page_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'page_title' ),
		'label'        => esc_html__( 'Show Page Title?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'page_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Page Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'page_title_layout' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_title',
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
	'page_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'priority'     => 4,
		'default'      => thewebs()->default( 'page_title_inner_layout' ),
		'label'        => esc_html__( 'Title Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.page-hero-section',
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
	'page_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Page Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'page_title_align' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.page-title',
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
	'page_title_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'page_layout',
		'priority'     => 5,
		'label'        => esc_html__( 'Title Container Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#inner-wrap .page-hero-section .entry-header',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'page_title_height' ),
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
	'page_title_elements' => array(
		'control_type' => 'thewebs_sorter_control',
		'section'      => 'page_layout',
		'priority'     => 6,
		'default'      => thewebs()->default( 'page_title_elements' ),
		'label'        => esc_html__( 'Title Elements', 'thewebs' ),
		'transport'    => 'refresh',
		'settings'     => array(
			'elements'   => 'page_title_elements',
			'title'      => 'page_title_element_title',
			'breadcrumb' => 'page_title_element_breadcrumb',
			'meta'       => 'page_title_element_meta',
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'defaults' => array(
				'title'      => thewebs()->default( 'page_title_element_title' ),
				'meta'       => thewebs()->default( 'page_title_element_meta' ),
				'breadcrumb' => thewebs()->default( 'page_title_element_breadcrumb' ),
			),
			'group' => 'page_title_element',
		),
		// 'partial'      => array(
		// 	'selector'            => '.page-title',
		// 	'container_inclusive' => false,
		// 	'render_callback'     => 'Thewebs\thewebs_entry_header',
		// ),
	),
	'page_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Page Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.wp-site-blocks .page-title h1',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'id'             => 'page_title_font',
			'headingInherit' => true,
		),
	),
	'page_title_breadcrumb_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_breadcrumb_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.page-title .thewebs-breadcrumbs',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.page-title .thewebs-breadcrumbs a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
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
	'page_title_breadcrumb_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Breadcrumb Font', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_breadcrumb_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.page-title .thewebs-breadcrumbs',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'id'      => 'page_title_breadcrumb_font',
			'options' => 'no-color',
		),
	),
	'page_title_meta_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Meta Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_meta_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.page-title .entry-meta',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.page-title .entry-meta a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
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
	'page_title_meta_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Meta Font', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_meta_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.page-title .entry-meta',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'id'      => 'page_title_breadcrumb_font',
			'options' => 'no-color',
		),
	),
	'page_title_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Page Title Background', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_background' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#inner-wrap .page-hero-section .entry-hero-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Page Title Background', 'thewebs' ),
		),
	),
	'page_title_featured_image' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'page_layout',
		'default'      => thewebs()->default( 'page_title_featured_image' ),
		'label'        => esc_html__( 'Use Featured Image for Background?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
	),
	'page_title_overlay_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_overlay_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.page-hero-section .hero-section-overlay',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
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
	'page_title_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'page_title_border' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'    => 'page_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'page_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'settings'     => array(
			'border_top'    => 'page_title_top_border',
			'border_bottom' => 'page_title_bottom_border',
		),
		'live_method'     => array(
			'page_title_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => '.page-hero-section .entry-hero-container-inner',
					'pattern'  => '$',
					'property' => 'border-top',
					'key'      => 'border',
				),
			),
			'page_title_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => '.page-hero-section .entry-hero-container-inner',
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'info_page_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'page_layout',
		'priority'     => 10,
		'label'        => esc_html__( 'Default Page Layout', 'thewebs' ),
		'settings'     => false,
	),
	'page_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Default Page Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'page_layout' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
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
			'responsive' => false,
			'class'      => 'thewebs-three-col',
		),
	),
	'page_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Page Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'page_sidebar_id' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'page_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'page_content_style' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.page',
				'pattern'  => 'content-style-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'name' => __( 'Boxed', 'thewebs' ),
					'icon' => 'boxed',
				),
				'unboxed' => array(
					'name' => __( 'Unboxed', 'thewebs' ),
					'icon' => 'narrow',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'page_vertical_padding' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'page_vertical_padding' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.page',
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
	'page_feature' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'page_layout',
		'priority'     => 20,
		'default'      => thewebs()->default( 'page_feature' ),
		'label'        => esc_html__( 'Show Featured Image?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'page_feature_position' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Featured Image Position', 'thewebs' ),
		'priority'     => 20,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'page_feature_position' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_feature',
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
	'page_feature_ratio' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Featured Image Ratio', 'thewebs' ),
		'priority'     => 20,
		'default'      => thewebs()->default( 'page_feature_ratio' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'page_feature',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.page .article-post-thumbnail',
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
	'page_comments' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'page_layout',
		'priority'     => 20,
		'default'      => thewebs()->default( 'page_comments' ),
		'label'        => esc_html__( 'Show Comments?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'page_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Site Background', 'thewebs' ),
		'default'      => thewebs()->default( 'page_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.page',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Page Background', 'thewebs' ),
		),
	),
	'page_content_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'page_layout',
		'label'        => esc_html__( 'Content Background', 'thewebs' ),
		'default'      => thewebs()->default( 'page_content_background' ),
		'live_method'  => array(
			array(
				'type'     => 'css_background',
				'selector' => 'body.page .content-bg, body.page.content-style-unboxed .site',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'tooltip' => __( 'Page Content Background', 'thewebs' ),
		),
	),
);

Theme_Customizer::add_settings( $settings );

