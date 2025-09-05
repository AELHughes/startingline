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
		'infinite_posts' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'infinite_scroll',
			'priority'     => 11,
			'default'      => thewebs()->default( 'infinite_posts' ),
			'label'        => esc_html__( 'Infinite Scroll for Blog?', 'thewebs-pro' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'This will use apply to all post archives.', 'thewebs-pro' ),
			),
			'transport'    => 'refresh',
		),
		// 'infinite_single_posts' => array(
		// 	'control_type' => 'thewebs_switch_control',
		// 	'section'      => 'infinite_scroll',
		// 	'priority'     => 11,
		// 	'default'      => thewebs()->default( 'infinite_single_posts' ),
		// 	'label'        => esc_html__( 'Infinite Scroll for Single Blog Posts?', 'thewebs-pro' ),
		// 	'input_attrs'  => array(
		// 		'help' => esc_html__( 'This will use apply to single posts.', 'thewebs-pro' ),
		// 	),
		// 	'transport'    => 'refresh',
		// ),
		'infinite_search' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'infinite_scroll',
			'priority'     => 11,
			'default'      => thewebs()->default( 'infinite_search' ),
			'label'        => esc_html__( 'Infinite Scroll for Search?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'infinite_products' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'infinite_scroll',
			'priority'     => 11,
			'default'      => thewebs()->default( 'infinite_products' ),
			'label'        => esc_html__( 'Infinite Scroll for Products?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'infinite_custom' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'infinite_scroll',
			'priority'     => 11,
			'default'      => thewebs()->default( 'infinite_custom' ),
			'label'        => esc_html__( 'Infinite Scroll for Custom Post Types?', 'thewebs-pro' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'This will use apply to all custom post archives.', 'thewebs-pro' ),
			),
			'transport'    => 'refresh',
		),
		'infinite_end_of_content' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'infinite_scroll',
			'priority'     => 12,
			'label'        => esc_html__( 'End of Content Text', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'infinite_end_of_content' ),
			'transport'    => 'refresh',
		),
	)
);
