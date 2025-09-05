<?php
/**
 * Header Main Row Options
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
	'mobile_html_tabs' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'mobile_html',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_tabs,
	),
	'mobile_html_content' => array(
		'control_type' => 'thewebs_editor_control',
		'section'      => 'mobile_html',
		'sanitize'     => 'wp_kses_post',
		'priority'     => 4,
		'default'      => thewebs()->default( 'mobile_html_content' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'id' => 'mobile_html',
		),
		'partial'      => array(
			'selector'            => '.mobile-html',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\mobile_html',
		),
	),
	'mobile_html_wpautop' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'mobile_html',
		'default'      => thewebs()->default( 'mobile_html_wpautop' ),
		'label'        => esc_html__( 'Automatically Add Paragraphs', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'partial'      => array(
			'selector'            => '.mobile-html',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\mobile_html',
		),
	),
	'mobile_html_typography' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'mobile_html',
		'label'        => esc_html__( 'Font', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'default'      => thewebs()->default( 'mobile_html_typography' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.mobile-html',
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
			'id' => 'mobile_html_typography',
		),
	),
	'mobile_html_link_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'mobile_html',
		'label'        => esc_html__( 'Link Colors', 'thewebs' ),
		'default'      => thewebs()->default( 'mobile_html_link_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.mobile-html a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '.mobile-html a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
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
	'mobile_html_link_style' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'mobile_html',
		'default'      => thewebs()->default( 'mobile_html_link_style' ),
		'label'        => esc_html__( 'Link Style', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'options' => array(
				'normal' => array(
					'name' => __( 'Underline', 'thewebs' ),
				),
				'plain' => array(
					'name' => __( 'No Underline', 'thewebs' ),
				),
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#mobile-header .mobile-html',
				'pattern'  => 'inner-link-style-$',
				'key'      => '',
			),
		),
	),
	'mobile_html_margin' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'mobile_html',
		'priority'     => 10,
		'default'      => thewebs()->default( 'mobile_html_margin' ),
		'label'        => esc_html__( 'Margin', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '.mobile-html',
				'property' => 'margin',
				'pattern'  => '$',
				'key'      => 'measure',
			),
		),
		'input_attrs'  => array(
			'responsive' => false,
		),
	),
);

Theme_Customizer::add_settings( $settings );

