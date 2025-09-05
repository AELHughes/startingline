<?php
/**
 * Header Top Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$thewebs_trans_settings = array(
	'transparent_header_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'transparent_header',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'transparent_header',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'transparent_header_design',
			),
			'active' => 'general',
		),
	),
	'transparent_header_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'transparent_header_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'transparent_header',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'transparent_header_design',
			),
			'active' => 'design',
		),
	),
	'transparent_header_enable' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'priority'     => 5,
		'default'      => thewebs()->default( 'transparent_header_enable' ),
		'label'        => esc_html__( 'Enable Transparent Header?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'transparent_header_archive' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'priority'     => 5,
		'default'      => thewebs()->default( 'transparent_header_archive' ),
		'label'        => esc_html__( 'Disable Search and Archives?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'transparent_header_page' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'priority'     => 5,
		'default'      => thewebs()->default( 'transparent_header_page' ),
		'label'        => esc_html__( 'Disable on Pages?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'transparent_header_post' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'priority'     => 5,
		'default'      => thewebs()->default( 'transparent_header_post' ),
		'label'        => esc_html__( 'Disable on Posts?', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'transparent_header_device' => array(
		'control_type' => 'thewebs_check_icon_control',
		'section'      => 'transparent_header',
		'priority'     => 10,
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'transparent_header_device' ),
		'label'        => esc_html__( 'Enable for:', 'thewebs' ),
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
		'input_attrs'  => array(
			'options' => array(
				'desktop' => array(
					'name' => __( 'Desktop', 'thewebs' ),
					'icon' => 'desktop',
				),
				'mobile' => array(
					'name' => __( 'Mobile', 'thewebs' ),
					'icon' => 'smartphone',
				),
			),
		),
	),
	'transparent_header_custom_logo' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'transport'    => 'refresh',
		'priority'     => 12,
		'default'      => thewebs()->default( 'transparent_header_custom_logo' ),
		'label'        => esc_html__( 'Different Logo for Transparent Header?', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'transparent_header_logo' => array(
		'control_type' => 'media',
		'section'      => 'transparent_header',
		'transport'    => 'refresh',
		'priority'     => 12,
		'mime_type'    => 'image',
		'default'      => '',
		'label'        => esc_html__( 'Transparent Header Logo', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
		),
	),
	'transparent_header_logo_width' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'transparent_header',
		'priority'     => 12,
		'label'        => esc_html__( 'Logo Max Width', 'thewebs' ),
		'description'  => esc_html__( 'Define the maxium width for the logo', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'logo_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'include',
				'responsive' => true,
				'value'      => 'logo',
			),
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_logo',
				'operator' => '!empty',
				'value'    => '',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .site-branding img',
				'property' => 'max-width',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'transparent_header_logo_width' ),
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
	'transparent_header_custom_mobile_logo' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'transparent_header',
		'transport'    => 'refresh',
		'priority'     => 12,
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
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_logo',
				'operator' => '!empty',
				'value'    => '',
			),
			array(
				'setting'  => '__device',
				'operator' => 'in',
				'value'    => array( 'tablet', 'mobile' ),
			),
		),
	),
	'transparent_header_mobile_logo' => array(
		'control_type' => 'media',
		'section'      => 'transparent_header',
		'transport'    => 'refresh',
		'priority'     => 12,
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
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_custom_mobile_logo',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => 'transparent_header_custom_logo',
				'operator' => '=',
				'value'    => true,
			),
			array(
				'setting'  => '__device',
				'operator' => 'in',
				'value'    => array( 'tablet', 'mobile' ),
			),
		),
	),
	'transparent_header_site_title_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Site Title Color', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_site_title_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .site-branding .site-title, .transparent-header #main-header .site-branding .site-description, .mobile-transparent-header #mobile-header .site-branding .site-title, .mobile-transparent-header #mobile-header .site-branding .site-description',
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
	'transparent_header_navigation_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Navigation Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_navigation_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-navigation .header-menu-container > ul > li.menu-item > a, .transparent-header .mobile-toggle-open-container .menu-toggle-open, .transparent-header .search-toggle-open-container .search-toggle-open',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-navigation .header-menu-container > ul > li.menu-item > a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-navigation .header-menu-container > ul > li.menu-item.current-menu-item > a, .transparent-header .header-navigation .header-menu-container > ul > li.menu-item.current_page_item > a',
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
	'transparent_header_navigation_background' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Navigation Items Background', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_navigation_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-menu-container > ul > li.menu-item > a',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-menu-container > ul > li.menu-item > a:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-menu-container > ul > li.menu-item.current-menu-item > a, .transparent-header .header-menu-container > ul > li.menu-item.current_page_item > a',
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
	'transparent_header_button_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Button Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_button_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button:hover, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'background',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button:hover, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'backgroundHover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'border',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-button:hover, .mobile-transparent-header .mobile-header-button-wrap .mobile-header-button:hover',
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
	'transparent_header_social_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Social Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_social_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button:hover, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'background',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button:hover, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button:hover',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'backgroundHover',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button',
				'property' => 'border-color',
				'pattern'  => '$',
				'key'      => 'border',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header .header-social-wrap a.social-button:hover, .mobile-transparent-header #mobile-header .header-mobile-social-wrap a.social-button:hover',
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
	'transparent_header_html_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'HTML Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_html_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-html,.mobile-transparent-header .mobile-html',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-html a, .mobile-transparent-header .mobile-html a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'link',
			),
			array(
				'type'     => 'css',
				'selector' => '.transparent-header #main-header .header-html a:hover, .mobile-transparent-header .mobile-html a:hover',
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
	'transparent_header_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Transparent Header Background', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_background' ),
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => array(
					'desktop' => '.transparent-header #wrapper #masthead',
					'tablet'  => '.mobile-transparent-header #wrapper #masthead',
					'mobile'  => '.mobile-transparent-header #wrapper #masthead',
				),
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Transparent Header Background', 'thewebs' ),
		),
	),
	'transparent_header_bottom_border' => array(
		'control_type' => 'thewebs_border_control',
		'section'      => 'transparent_header_design',
		'label'        => esc_html__( 'Bottom Border', 'thewebs' ),
		'default'      => thewebs()->default( 'transparent_header_bottom_border' ),
		'context'      => array(
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_border',
				'selector' => array(
					'desktop' => '.transparent-header #wrapper #masthead',
					'tablet'  => '.mobile-transparent-header #wrapper #masthead',
					'mobile'  => '.mobile-transparent-header #wrapper #masthead',
				),
				'property' => 'border-bottom',
				'pattern'  => '$',
				'key'      => 'border',
			),
		),
	),
);

if ( class_exists( 'woocommerce' ) ) {
	$thewebs_trans_settings = array_merge(
		$thewebs_trans_settings,
		array(
			'transparent_header_product' => array(
				'control_type' => 'thewebs_switch_control',
				'sanitize'     => 'thewebs_sanitize_toggle',
				'section'      => 'transparent_header',
				'priority'     => 5,
				'default'      => thewebs()->default( 'transparent_header_product' ),
				'label'        => esc_html__( 'Disable on Products?', 'thewebs' ),
				'transport'    => 'refresh',
				'context'      => array(
					array(
						'setting'  => 'transparent_header_enable',
						'operator' => '=',
						'value'    => true,
					),
				),
			),
			'transparent_header_cart_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => 'transparent_header_design',
				'label'        => esc_html__( 'Cart Colors', 'thewebs' ),
				'default'      => thewebs()->default( 'transparent_header_cart_color' ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button:hover, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'background',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button:hover, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button:hover',
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
			'transparent_header_cart_total_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => 'transparent_header_design',
				'label'        => esc_html__( 'Cart Total Colors', 'thewebs' ),
				'default'      => thewebs()->default( 'transparent_header_cart_total_color' ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button .header-cart-total, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button .header-cart-total',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button:hover .header-cart-total, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button:hover .header-cart-total',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button .header-cart-total, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button .header-cart-total',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'background',
					),
					array(
						'type'     => 'css',
						'selector' => '.transparent-header #main-header .header-cart-wrap .header-cart-button:hover .header-cart-total, .mobile-transparent-header #mobile-header .header-mobile-cart-wrap .header-cart-button:hover .header-cart-total',
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

$thewebs_trans_post_types        = thewebs()->get_post_types_objects();
$thewebs_trans_extras_post_types = array();
$thewebs_trans_add_extras        = false;
foreach ( $thewebs_trans_post_types as $post_type_item ) {
	$post_type_name  = $post_type_item->name;
	$post_type_label = $post_type_item->label;
	$ignore_type     = thewebs()->get_transparent_post_types_to_ignore();
	if ( ! in_array( $post_type_name, $ignore_type, true ) ) {
		$thewebs_trans_add_extras = true;
		$thewebs_trans_extras_post_types[ 'transparent_header_' . $post_type_name ] = array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'transparent_header',
			'priority'     => 5,
			'default'      => true,
			'label'        => esc_html__( 'Disable on', 'thewebs' ) . ' ' . $post_type_label . '?',
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'  => 'transparent_header_enable',
					'operator' => '=',
					'value'    => true,
				),
			),
		);
	}
}
if ( $thewebs_trans_add_extras ) {
	$thewebs_trans_settings = array_merge(
		$thewebs_trans_settings,
		$thewebs_trans_extras_post_types
	);
}
Theme_Customizer::add_settings( $thewebs_trans_settings );

