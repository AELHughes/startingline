<?php
/**
 * Woocommerce Product Catalog Options.
 *
 * @package Thewebs_Pro
 */

namespace Thewebs_Pro;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

Theme_Customizer::add_settings(
	array(
		'info_product_sticky_add_to_cart' => array(
			'control_type' => 'thewebs_title_control',
			'priority'     => 20,
			'section'      => 'product_layout',
			'label'        => esc_html__( 'Sticky Add To Cart', 'thewebs-pro' ),
			'settings'     => false,
		),
		'product_sticky_add_to_cart' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'product_layout',
			'priority'     => 20,
			'default'      => thewebs()->default( 'product_sticky_add_to_cart' ),
			'label'        => esc_html__( 'Enabled Sticky Add to Cart', 'thewebs-pro' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'Adds a Sticky Bar with add to cart when you scroll down the product page.', 'thewebs-pro' ),
			),
			'transport'    => 'refresh',
		),
		'product_sticky_add_to_cart_placement' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'product_layout',
			'default'      => thewebs()->default( 'product_sticky_add_to_cart_placement' ),
			'label'        => esc_html__( 'Sticky Placement', 'thewebs-pro' ),
			'priority'     => 20,
			'context'      => array(
				array(
					'setting'    => 'product_sticky_add_to_cart',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '#thewebs-sticky-add-to-cart',
					'pattern'  => 'thewebs-sticky-add-to-cart-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'header' => array(
						'name' => __( 'Top', 'thewebs-pro' ),
					),
					'footer' => array(
						'name' => __( 'Bottom', 'thewebs-pro' ),
					),
				),
				'responsive' => false,
				'class'      => 'thewebs-two-forced',
			),
		),
		'product_sticky_mobile_add_to_cart' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'product_layout',
			'priority'     => 20,
			'default'      => thewebs()->default( 'product_sticky_mobile_add_to_cart' ),
			'label'        => esc_html__( 'Enabled for mobile', 'thewebs-pro' ),
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'    => 'product_sticky_add_to_cart',
					'operator'   => '=',
					'value'      => true,
				),
			),
		),
		'product_sticky_mobile_add_to_cart_placement' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'product_layout',
			'default'      => thewebs()->default( 'product_sticky_mobile_add_to_cart_placement' ),
			'label'        => esc_html__( 'Mobile Placement', 'thewebs-pro' ),
			'priority'     => 20,
			'context'      => array(
				array(
					'setting'    => 'product_sticky_add_to_cart',
					'operator'   => '=',
					'value'      => true,
				),
				array(
					'setting'    => 'product_sticky_mobile_add_to_cart',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '#thewebs-sticky-mobile-add-to-cart',
					'pattern'  => 'thewebs-sticky-add-to-cart-$',
					'key'      => '',
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'header' => array(
						'name' => __( 'Top', 'thewebs-pro' ),
					),
					'footer' => array(
						'name' => __( 'Bottom', 'thewebs-pro' ),
					),
				),
				'responsive' => false,
				'class'      => 'thewebs-two-forced',
			),
		),
	)
);

