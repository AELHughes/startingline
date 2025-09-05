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
		'header_scripts' => array(
			'type'         => 'code_editor',
			'section'      => 'scripts',
			'priority'     => 11,
			'code_type'   => 'text/js',
			'default'      => thewebs()->default( 'header_scripts' ),
			'label'        => esc_html__( 'Add scripts into your header', 'thewebs-pro' ),
		),
		'after_body_scripts' => array(
			'type'         => 'code_editor',
			'section'      => 'scripts',
			'priority'     => 11,
			'code_type'   => 'text/js',
			'default'      => thewebs()->default( 'after_body_scripts' ),
			'label'        => esc_html__( 'Add scripts right after opening body tag', 'thewebs-pro' ),
		),
		'footer_scripts' => array(
			'type'         => 'code_editor',
			'section'      => 'scripts',
			'priority'     => 11,
			'code_type'   => 'text/js',
			'default'      => thewebs()->default( 'footer_scripts' ),
			'label'        => esc_html__( 'Add scripts into your footer', 'thewebs-pro' ),
		),
	)
);
