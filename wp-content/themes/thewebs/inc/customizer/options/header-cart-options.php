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
		'header_cart_tabs' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'cart',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs' ),
					'target' => 'cart',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs' ),
					'target' => 'cart_design',
				),
				'active' => 'general',
			),
		),
		'header_cart_tabs_design' => array(
			'control_type' => 'thewebs_tab_control',
			'section'      => 'cart_design',
			'settings'     => false,
			'priority'     => 1,
			'input_attrs'  => array(
				'general' => array(
					'label'  => __( 'General', 'thewebs' ),
					'target' => 'cart',
				),
				'design' => array(
					'label'  => __( 'Design', 'thewebs' ),
					'target' => 'cart_design',
				),
				'active' => 'design',
			),
		),
		'header_cart_label' => array(
			'control_type' => 'thewebs_text_control',
			'section'      => 'cart',
			'sanitize'     => 'sanitize_text_field',
			'priority'     => 6,
			'default'      => thewebs()->default( 'header_cart_label' ),
			'label'        => esc_html__( 'Cart Label', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'html',
					'selector' => '.header-mobile-cart-wrap .header-cart-label',
					'pattern'  => '$',
					'key'      => '',
				),
			),
		),
		'header_cart_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'cart',
			'priority'     => 10,
			'default'      => thewebs()->default( 'header_cart_icon' ),
			'label'        => esc_html__( 'Cart Icon', 'thewebs' ),
			'partial'      => array(
				'selector'            => '.header-cart-wrap',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs\header_cart',
			),
			'input_attrs'  => array(
				'layout' => array(
					'shopping-bag' => array(
						'icon' => 'shoppingBag',
					),
					'shopping-cart' => array(
						'icon' => 'shoppingCart',
					),
				),
				'responsive' => false,
			),
		),
		'header_cart_style' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'cart',
			'priority'     => 10,
			'default'      => thewebs()->default( 'header_cart_style' ),
			'label'        => esc_html__( 'Cart Click Action', 'thewebs' ),
			'transport'    => 'refresh',
			'input_attrs'  => array(
				'layout' => array(
					'link' => array(
						'name' => __( 'Link', 'thewebs' ),
					),
					'slide' => array(
						'name' => __( 'Popout Cart', 'thewebs' ),
					),
					'dropdown' => array(
						'name' => __( 'Dropdown Cart', 'thewebs' ),
					),
				),
				'responsive' => false,
			),
		),
		'header_cart_show_total' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'cart',
			'priority'     => 6,
			'partial'      => array(
				'selector'            => '.header-cart-wrap',
				'container_inclusive' => true,
				'render_callback'     => 'Thewebs\header_cart',
			),
			'default'      => thewebs()->default( 'header_cart_show_total' ),
			'label'        => esc_html__( 'Show Item Total Indicator', 'thewebs' ),
		),
		'header_cart_icon_size' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Icon Size', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.header-cart-wrap .header-cart-button .thewebs-svg-iconset',
					'property' => 'font-size',
					'pattern'  => '$',
					'key'      => 'size',
				),
			),
			'default'      => thewebs()->default( 'header_cart_icon_size' ),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
				),
				'max'        => array(
					'px'  => 100,
					'em'  => 12,
					'rem' => 12,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
				),
				'units'      => array( 'px', 'em', 'rem' ),
				'responsive' => false,
			),
		),
		'header_cart_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Cart Colors', 'thewebs' ),
			'default'      => thewebs()->default( 'header_cart_color' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.site-header-item .header-cart-wrap .header-cart-inner-wrap .header-cart-button',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.site-header-item .header-cart-wrap .header-cart-inner-wrap .header-cart-button:hover',
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
						'tooltip' => __( 'Hover Color', 'thewebs' ),
						'palette' => true,
					),
				),
			),
		),
		'header_cart_background' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Cart Background', 'thewebs' ),
			'default'      => thewebs()->default( 'header_cart_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.site-header-item .header-cart-wrap .header-cart-inner-wrap .header-cart-button',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.site-header-item .header-cart-wrap .header-cart-inner-wrap .header-cart-button:hover',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'hover',
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
				),
			),
		),
		'header_cart_total_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Cart Total Colors', 'thewebs' ),
			'default'      => thewebs()->default( 'header_cart_total_color' ),
			'context'      => array(
				array(
					'setting'  => 'header_cart_show_total',
					'operator' => '=',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.header-cart-wrap .header-cart-button .header-cart-total',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.header-cart-wrap .header-cart-button:hover .header-cart-total',
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
						'tooltip' => __( 'Hover Color', 'thewebs' ),
						'palette' => true,
					),
				),
			),
		),
		'header_cart_total_background' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Cart Total Background', 'thewebs' ),
			'default'      => thewebs()->default( 'header_cart_total_background' ),
			'context'      => array(
				array(
					'setting'  => 'header_cart_show_total',
					'operator' => '=',
					'value'    => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.header-cart-wrap .header-cart-button .header-cart-total',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.header-cart-wrap .header-cart-button:hover .header-cart-total',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'hover',
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
				),
			),
		),
		'header_cart_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'cart_design',
			'label'        => esc_html__( 'Cart Label Font', 'thewebs' ),
			'context'      => array(
				array(
					'setting'  => 'header_cart_label',
					'operator' => '!empty',
					'value'    => '',
				),
			),
			'default'      => thewebs()->default( 'header_cart_typography' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.header-cart-wrap .header-cart-button .header-cart-label',
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
				'id'      => 'header_cart_typography',
				'options' => 'no-color',
			),
		),
		'header_cart_padding' => array(
			'control_type' => 'thewebs_measure_control',
			'section'      => 'cart_design',
			'priority'     => 10,
			'default'      => thewebs()->default( 'header_cart_padding' ),
			'label'        => esc_html__( 'Cart Padding', 'thewebs' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.site-header-item .header-cart-wrap .header-cart-inner-wrap .header-cart-button',
					'property' => 'padding',
					'pattern'  => '$',
					'key'      => 'measure',
				),
			),
			'input_attrs'  => array(
				'responsive' => false,
			),
		),
		'header_cart_popup_side' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'cart',
			'priority'     => 20,
			'default'      => thewebs()->default( 'header_cart_popup_side' ),
			'label'        => esc_html__( 'Slide-Out Side', 'thewebs' ),
			'context'      => array(
				array(
					'setting'    => 'header_cart_style',
					'operator'   => '=',
					'value'      => 'slide',
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '#cart-drawer',
					'pattern'  => 'popup-drawer-side-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'left' => array(
						'tooltip' => __( 'Reveal from Left', 'thewebs' ),
						'name'    => __( 'Left', 'thewebs' ),
						'icon'    => '',
					),
					'right' => array(
						'tooltip' => __( 'Reveal from Right', 'thewebs' ),
						'name'    => __( 'Right', 'thewebs' ),
						'icon'    => '',
					),
				),
				'responsive' => false,
			),
		),
	)
);
