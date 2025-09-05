<?php
/**
 * Header Top Row Options
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
	'header_top_tabs' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'header_top',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_tabs,
	),
	'header_top_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'header_top',
		'priority'     => 4,
		'default'      => thewebs()->default( 'header_top_layout' ),
		'label'        => esc_html__( 'Layout', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => array(
					'desktop' => '.site-top-header-wrap',
					'tablet'  => '#mobile-header .site-top-header-wrap',
					'mobile'  => '#mobile-header .site-top-header-wrap',
				),
				'pattern'  => array(
					'desktop' => 'site-header-row-layout-$',
					'tablet'  => 'site-header-row-tablet-layout-$',
					'mobile'  => 'site-header-row-mobile-layout-$',
				),
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
		),
	),
	'header_top_height' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_top',
		'priority'     => 5,
		'label'        => esc_html__( 'Min Height', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#masthead .site-top-header-inner-wrap',
				'property' => 'min-height',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'default'      => thewebs()->default( 'header_top_height' ),
		'input_attrs'  => array(
			'min'     => array(
				'px'  => 10,
				'em'  => 1,
				'rem' => 1,
				'vh'  => 2,
			),
			'max'     => array(
				'px'  => 400,
				'em'  => 12,
				'rem' => 12,
				'vh'  => 40,
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
	'header_top_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'header_top',
		'label'        => esc_html__( 'Top Row Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_top_background' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '.site-top-header-wrap .site-header-row-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Top Row Background', 'thewebs' ),
		),
	),
	'header_top_border' => array(
		'control_type' => 'thewebs_borders_control',
		'section'      => 'header_top',
		'label'        => esc_html__( 'Border', 'thewebs' ),
		'default'      => thewebs()->default( 'header_top_border' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'settings'     => array(
			'border_top'    => 'header_top_top_border',
			'border_bottom' => 'header_top_bottom_border',
		),
		'live_method'     => array(
			'header_top_top_border' => array(
				array(
					'type'     => 'css_border',
					'selector' => array(
						'desktop' => '.site-top-header-wrap .site-header-row-container-inner',
						'tablet'  => '#mobile-header .site-top-header-wrap .site-header-row-container-inner',
						'mobile'  => '#mobile-header .site-top-header-wrap .site-header-row-container-inner',
					),
					'pattern'  => array(
						'desktop' => '$',
						'tablet'  => '$',
						'mobile'  => '$',
					),
					'property' => 'border-top',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
			'header_top_bottom_border' => array( 
				array(
					'type'     => 'css_border',
					'selector' => array(
						'desktop' => '.site-top-header-wrap .site-header-row-container-inner',
						'tablet'  => '#mobile-header .site-top-header-wrap .site-header-row-container-inner',
						'mobile'  => '#mobile-header .site-top-header-wrap .site-header-row-container-inner',
					),
					'pattern'  => array(
						'desktop' => '$',
						'tablet'  => '$',
						'mobile'  => '$',
					),
					'property' => 'border-bottom',
					'pattern'  => '$',
					'key'      => 'border',
				),
			),
		),
	),
	'header_top_trans_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'header_top',
		'label'        => esc_html__( '(When Transparent Header) Top Row Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_top_trans_background' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
			array(
				'setting'  => 'transparent_header_enable',
				'operator' => '=',
				'value'    => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '.transparent-header #masthead .site-top-header-wrap .site-header-row-container-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Transparent Header Top Row Background', 'thewebs' ),
		),
	),
	'header_top_padding' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'header_top',
		'default'      => thewebs()->default( 'header_top_padding' ),
		'label'        => esc_html__( 'Padding', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.site-top-header-wrap .site-header-row-container-inner>.site-container',
				'property' => 'padding',
				'pattern'  => '$',
				'key'      => 'measure',
			),
		),
		'input_attrs'  => array(
			'min'        => array(
				'px'  => 0,
				'em'  => 0,
				'rem' => 0,
			),
			'max'        => array(
				'px'  => 100,
				'em'  => 6,
				'rem' => 6,
			),
			'step'       => array(
				'px'  => 1,
				'em'  => 0.01,
				'rem' => 0.01,
			),
			'units'      => array( 'px', 'em', 'rem' ),
			'responsive' => true,
		),
	),
);

Theme_Customizer::add_settings( $settings );

