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
		'info_background' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Backgrounds', 'thewebs' ),
			'settings'     => false,
		),
		'site_background' => array(
			'control_type' => 'thewebs_background_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Site Background', 'thewebs' ),
			'default'      => thewebs()->default( 'site_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css_background',
					'selector' => 'body',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'base',
				),
			),
			'input_attrs'  => array(
				'tooltip'  => __( 'Site Background', 'thewebs' ),
			),
		),
		'content_background' => array(
			'control_type' => 'thewebs_background_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Content Background', 'thewebs' ),
			'default'      => thewebs()->default( 'content_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css_background',
					'selector' => '.content-bg, body.content-style-unboxed .site',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'base',
				),
			),
			'input_attrs'  => array(
				'tooltip'  => __( 'Content Background', 'thewebs' ),
			),
		),
		'above_title_background' => array(
			'control_type' => 'thewebs_background_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Title Above Content Background', 'thewebs' ),
			'default'      => thewebs()->default( 'above_title_background' ),
			'live_method'     => array(
				array(
					'type'     => 'css_background',
					'selector' => '.wp-site-blocks .entry-hero-container-inner',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'base',
				),
			),
			'input_attrs'  => array(
				'tooltip'  => __( 'Title Above Content Background', 'thewebs' ),
			),
		),
		'above_title_overlay_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Title Above Content Overlay Color', 'thewebs' ),
			'default'      => thewebs()->default( 'above_title_overlay_color' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.entry-hero-container-inner .hero-section-overlay',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
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
		'info_links' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'general_colors',
			'label'        => esc_html__( 'Content Links', 'thewebs' ),
			'settings'     => false,
		),
		'link_color' => array(
			'control_type' => 'thewebs_color_link_control',
			'section'      => 'general_colors',
			'transport'    => 'refresh',
			'label'        => esc_html__( 'Links Color', 'thewebs' ),
			'default'      => thewebs()->default( 'link_color' ),
			'live_method'     => array(
				array(
					'type'     => 'css_link',
					'selector' => 'a',
					'property' => 'color',
					'pattern'  => 'link-style-$',
					'key'      => 'base',
				),
			),
		),
	)
);

