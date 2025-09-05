<?php
/**
 * Woocommerce Trigger Cart when Product added Options.
 *
 * @package Thewebs_Pro
 */

namespace Thewebs_Pro;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;
Theme_Customizer::add_settings(
	array(
		'cart_pop_show_on_add' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'cart_behavior',
			'priority'     => 11,
			'default'      => thewebs()->default( 'cart_pop_show_on_add' ),
			'label'        => esc_html__( 'Show the cart popout on add to cart?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'ajax_add_single_products' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'cart_behavior',
			'priority'     => 11,
			'default'      => thewebs()->default( 'ajax_add_single_products' ),
			'label'        => esc_html__( 'Single Product Ajax Add to Cart', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
	)
);
