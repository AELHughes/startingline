<?php
/**
 * Header Sticky Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'header_sticky_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_sticky',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'header_sticky',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'header_sticky_design',
			),
			'active' => 'general',
		),
	),
	'header_sticky_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'header_sticky_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'header_sticky',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'header_sticky_design',
			),
			'active' => 'design',
		),
	),
	'header_sticky' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'header_sticky',
		'priority'     => 10,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'header_sticky' ),
		'label'        => esc_html__( 'Enable Sticky Header?', 'thewebs' ),
		'input_attrs'  => array(
			'options' => array(
				'no' => array(
					'name' => __( 'No', 'thewebs' ),
				),
				'main' => array(
					'name' => __( 'Yes - Only Main Row', 'thewebs' ),
				),
				'top_main' => array(
					'name' => __( 'Yes - Top Row & Main Row', 'thewebs' ),
				),
				'top_main_bottom' => array(
					'name' => __( 'Yes - Whole Header', 'thewebs' ),
				),
				'top' => array(
					'name' => __( 'Yes - Only Top Row', 'thewebs' ),
				),
				'bottom' => array(
					'name' => __( 'Yes - Only Bottom Row', 'thewebs' ),
				),
			),
		),
	),
	'header_reveal_scroll_up' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'default'      => thewebs()->default( 'header_reveal_scroll_up' ),
		'label'        => esc_html__( 'Enable Reveal Sticky on Scroll up', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'header_sticky_shrink' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'default'      => thewebs()->default( 'header_sticky_shrink' ),
		'label'        => esc_html__( 'Enable Main Row Shrinking', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'header_sticky_main_shrink' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_sticky',
		'label'        => esc_html__( 'Main Row Shrink Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'  => 'header_sticky_shrink',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'header_sticky',
				'operator' => 'contain',
				'value'    => 'main',
			),
		),
		'default'      => thewebs()->default( 'header_sticky_main_shrink' ),
		'input_attrs'  => array(
			'min'        => array(
				'px'  => 5,
				'em'  => 0,
				'rem' => 0,
			),
			'max'        => array(
				'px'  => 400,
				'em'  => 12,
				'rem' => 12,
			),
			'step'       => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
			),
			'units'      => array( 'px' ),
			'responsive' => false,
		),
	),
	'header_sticky_custom_logo' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'header_sticky_custom_logo' ),
		'label'        => esc_html__( 'Different Logo for Stuck Header?', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'header_sticky_logo' => array(
		'control_type' => 'media',
		'section'      => 'header_sticky',
		'transport'    => 'refresh',
		'mime_type'    => 'image',
		'default'      => '',
		'label'        => esc_html__( 'Stuck Header Logo', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
			array(
				'setting'  => 'header_sticky_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'header_sticky_logo_width' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_sticky',
		'label'        => esc_html__( 'Logo Max Width', 'thewebs' ),
		'description'  => esc_html__( 'Define the maxium width for the logo', 'thewebs' ),
		'context'      => array(
			array(
				'setting'  => 'header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'header_sticky_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'header_sticky_logo',
				'operator' => '!empty',
				'value'    => '',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .site-branding img',
				'property' => 'max-width',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'header_sticky_logo_width' ),
		'input_attrs'  => array(
			'min'     => array(
				'px'  => 10,
				'em'  => 1,
				'rem' => 1,
				'vw'  => 2,
				'%'   => 2,
			),
			'max'     => array(
				'px'  => 800,
				'em'  => 12,
				'rem' => 12,
				'vw'  => 80,
				'%'   => 80,
			),
			'step'    => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
				'vw'  => 1,
				'%'   => 1,
			),
			'units'   => array( 'px', 'em', 'rem', 'vw', '%' ),
		),
	),
	'info_mobile_header_sticky' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'header_sticky',
		'priority'     => 20,
		'label'        => esc_html__( 'Mobile Sticky', 'thewebs' ),
		'settings'     => false,
	),
	'mobile_header_sticky' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'header_sticky',
		'priority'     => 20,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'mobile_header_sticky' ),
		'label'        => esc_html__( 'Enable Sticky for Mobile?', 'thewebs' ),
		'input_attrs'  => array(
			'options' => array(
				'no' => array(
					'name' => __( 'No', 'thewebs' ),
				),
				'main' => array(
					'name' => __( 'Yes - Only Main Row', 'thewebs' ),
				),
				'top_main' => array(
					'name' => __( 'Yes - Top Row & Main Row', 'thewebs' ),
				),
				'top_main_bottom' => array(
					'name' => __( 'Yes - Whole Header', 'thewebs' ),
				),
				'top' => array(
					'name' => __( 'Yes - Only Top Row', 'thewebs' ),
				),
				'bottom' => array(
					'name' => __( 'Yes - Only Bottom Row', 'thewebs' ),
				),
			),
		),
	),
	'mobile_header_reveal_scroll_up' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'priority'     => 20,
		'default'      => thewebs()->default( 'header_reveal_scroll_up' ),
		'label'        => esc_html__( 'Enable Reveal Sticky on Scroll up', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'mobile_header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'mobile_header_sticky_shrink' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'priority'     => 20,
		'default'      => thewebs()->default( 'mobile_header_sticky_shrink' ),
		'label'        => esc_html__( 'Enabled Main Row Shrinking', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'mobile_header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'mobile_header_sticky_main_shrink' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_sticky',
		'priority'     => 20,
		'label'        => esc_html__( 'Main Row Shrink Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting'  => 'mobile_header_sticky_shrink',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'mobile_header_sticky',
				'operator' => 'contain',
				'value'    => 'main',
			),
		),
		'default'      => thewebs()->default( 'mobile_header_sticky_main_shrink' ),
		'input_attrs'  => array(
			'min'        => array(
				'px'  => 5,
				'em'  => 0,
				'rem' => 0,
			),
			'max'        => array(
				'px'  => 400,
				'em'  => 12,
				'rem' => 12,
			),
			'step'       => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
			),
			'units'      => array( 'px' ),
			'responsive' => false,
		),
	),
	'header_sticky_custom_mobile_logo' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'header_sticky',
		'transport'    => 'refresh',
		'priority'     => 20,
		'default'      => thewebs()->default( 'use_mobile_logo' ),
		'label'        => esc_html__( 'Different Logo for Mobile?', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'mobile_header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
		),
	),
	'header_sticky_mobile_logo' => array(
		'control_type' => 'media',
		'section'      => 'header_sticky',
		'transport'    => 'refresh',
		'priority'     => 20,
		'mime_type'    => 'image',
		'default'      => '',
		'label'        => esc_html__( 'Mobile Logo', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'mobile_header_sticky',
				'operator' => '!=',
				'value'    => 'no',
			),
			array(
				'setting'  => 'header_sticky_custom_mobile_logo',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'header_sticky_site_title_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Site Title Color', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_site_title_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .site-branding .site-title, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .site-branding .site-description',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Initial Color', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_navigation_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Navigation Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_navigation_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li > a, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-toggle-open-container .menu-toggle-open, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .search-toggle-open-container .search-toggle-open',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li > a:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-toggle-open-container .menu-toggle-open:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .search-toggle-open-container .search-toggle-open:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li.current-menu-item > a, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li.current_page_item > a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'active',
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
				'active' => array(
					'tooltip' => __( 'Active Color', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_navigation_background' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Navigation Items Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_navigation_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li > a',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li > a:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li.current-menu-item > a, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-menu-container > ul > li.current_page_item > a',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'active',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Initial Background', 'thewebs' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Hover Background', 'thewebs' ),
					'palette' => true,
				),
				'active' => array(
					'tooltip' => __( 'Active Background', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_button_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Button Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_button_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'background',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'backgroundHover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'border',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-header-button-wrap .mobile-header-button:hover',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'borderHover',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Color', 'thewebs' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Hover Color', 'thewebs' ),
					'palette' => true,
				),
				'background' => array(
					'tooltip' => __( 'Background', 'thewebs' ),
					'palette' => true,
				),
				'backgroundHover' => array(
					'tooltip' => __( 'Background Hover', 'thewebs' ),
					'palette' => true,
				),
				'border' => array(
					'tooltip' => __( 'Border', 'thewebs' ),
					'palette' => true,
				),
				'borderHover' => array(
					'tooltip' => __( 'Border Hover', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_social_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Social Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_social_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'background',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'backgroundHover',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'border',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-social-wrap a.social-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-social-wrap a.social-button:hover',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'borderHover',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Color', 'thewebs' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Hover Color', 'thewebs' ),
					'palette' => true,
				),
				'background' => array(
					'tooltip' => __( 'Background', 'thewebs' ),
					'palette' => true,
				),
				'backgroundHover' => array(
					'tooltip' => __( 'Background Hover', 'thewebs' ),
					'palette' => true,
				),
				'border' => array(
					'tooltip' => __( 'Border', 'thewebs' ),
					'palette' => true,
				),
				'borderHover' => array(
					'tooltip' => __( 'Border Hover', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_html_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'HTML Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_html_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-html,#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-html',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-html a, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-html a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'link',
			),
			array(
				'type'     => 'css',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-html a:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .mobile-html a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting'  => '__device',
				'operator' => '==',
				'value'    => 'desktop',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Color', 'thewebs' ),
					'palette' => true,
				),
				'link' => array(
					'tooltip' => __( 'Link Color', 'thewebs' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Link Hover', 'thewebs' ),
					'palette' => true,
				),
			),
		),
	),
	'header_sticky_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Sticky Header Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '.wp-site-blocks #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start):not(.site-header-row-container), .wp-site-blocks #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) > .site-header-row-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Sticky Header Background', 'thewebs' ),
		),
	),
	'header_sticky_bottom_border' => array(
		'control_type' => 'thewebs_border_control',
		'section'      => 'header_sticky_design',
		'label'        => esc_html__( 'Sticky Bottom Border', 'thewebs' ),
		'default'      => thewebs()->default( 'header_sticky_bottom_border' ),
		'live_method'     => array(
			array(
				'type'     => 'css_border',
				'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start)',
				'property' => 'border-bottom',
				'pattern'  => '$',
				'key'      => 'border',
			),
		),
	),
);
if ( class_exists( 'woocommerce' ) ) {
	$settings = array_merge(
		$settings,
		array(
			'header_sticky_cart_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => 'header_sticky_design',
				'label'        => esc_html__( 'Cart Colors', 'thewebs' ),
				'default'      => thewebs()->default( 'header_sticky_cart_color' ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button:hover, , #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'background',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button:hover, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button:hover',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'backgroundHover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Hover Color', 'thewebs' ),
							'palette' => true,
						),
						'background' => array(
							'tooltip' => __( 'Background', 'thewebs' ),
							'palette' => true,
						),
						'backgroundHover' => array(
							'tooltip' => __( 'Background Hover', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			'header_sticky_cart_total_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => 'header_sticky_design',
				'label'        => esc_html__( 'Cart Total Colors', 'thewebs' ),
				'default'      => thewebs()->default( 'header_sticky_cart_total_color' ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button .header-cart-total, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button .header-cart-total',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button:hover .header-cart-total, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button:hover .header-cart-total',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button .header-cart-total, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button .header-cart-total',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'background',
					),
					array(
						'type'     => 'css',
						'selector' => '#masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-cart-wrap .header-cart-button:hover .header-cart-total, #masthead .thewebs-sticky-header.item-is-fixed:not(.item-at-start) .header-mobile-cart-wrap .header-cart-button:hover .header-cart-total',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'backgroundHover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Hover Color', 'thewebs' ),
							'palette' => true,
						),
						'background' => array(
							'tooltip' => __( 'Background', 'thewebs' ),
							'palette' => true,
						),
						'backgroundHover' => array(
							'tooltip' => __( 'Background Hover', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
		)
	);
}

Theme_Customizer::add_settings( $settings );

