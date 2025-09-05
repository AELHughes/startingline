<?php
/**
 * Breadcrumb Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

Theme_Customizer::add_settings(
	array(
		'breadcrumb_engine' => array(
			'control_type' => 'thewebs_select_control',
			'section'      => 'breadcrumbs',
			'transport'    => 'refresh',
			'default'      => thewebs()->default( 'breadcrumb_engine' ),
			'label'        => esc_html__( 'Breadcrumb Engine', 'thewebs' ),
			'input_attrs'  => array(
				'options' => array(
					'' => array(
						'name' => __( 'Default', 'thewebs' ),
					),
					'rankmath' => array(
						'name' => __( 'RankMath (must have activated in plugin)', 'thewebs' ),
					),
					'yoast' => array(
						'name' => __( 'Yoast (must have activated in plugin)', 'thewebs' ),
					),
					'seopress' => array(
						'name' => __( 'SEOPress (must have activated in plugin)', 'thewebs' ),
					),
				),
			),
		),
		'breadcrumb_home_icon' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'breadcrumbs',
			'default'      => thewebs()->default( 'breadcrumb_home_icon' ),
			'label'        => esc_html__( 'Use icon for home?', 'thewebs' ),
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'    => 'breadcrumb_engine',
					'operator'   => '=',
					'value'      => '',
				),
			),
		),
	)
);
