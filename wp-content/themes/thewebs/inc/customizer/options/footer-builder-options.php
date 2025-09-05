<?php
/**
 * Header Builder Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

ob_start(); ?>
<!-- <div class="thewebs-build-tabs nav-tab-wrapper wp-clearfix">
	<a href="#" class="nav-tab preview-desktop thewebs-build-tabs-button" data-device="desktop">
		<span class="dashicons dashicons-desktop"></span>
		<span><?php esc_html_e( 'Desktop', 'thewebs' ); ?></span>
	</a>
	<a href="#" class="nav-tab preview-tablet preview-mobile thewebs-build-tabs-button" data-device="tablet">
		<span class="dashicons dashicons-smartphone"></span>
		<span><?php esc_html_e( 'Tablet / Mobile', 'thewebs' ); ?></span>
	</a>
</div> -->
<span class="button button-secondary thewebs-builder-hide-button thewebs-builder-tab-toggle"><span class="dashicons dashicons-no"></span><?php esc_html_e( 'Hide', 'thewebs' ); ?></span>
<span class="button button-secondary thewebs-builder-show-button thewebs-builder-tab-toggle"><span class="dashicons dashicons-edit"></span><?php esc_html_e( 'Footer Builder', 'thewebs' ); ?></span>
<?php
$builder_tabs = ob_get_clean();
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
	'footer_builder' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'footer_builder',
		'settings'     => false,
		'description'  => $builder_tabs,
	),
	'footer_items' => array(
		'control_type' => 'thewebs_builder_control',
		'section'      => 'footer_builder',
		'default'      => thewebs()->default( 'footer_items' ),
		'partial'      => array(
			'selector'            => '#colophon',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\footer_markup',
		),
		'choices'      => array(
			'footer-navigation'          => array(
				'name'    => esc_html__( 'Footer Navigation', 'thewebs' ),
				'section' => 'thewebs_customizer_footer_navigation',
			),
			'footer-social'        => array(
				'name'    => esc_html__( 'Social', 'thewebs' ),
				'section' => 'thewebs_customizer_footer_social',
			),
			'footer-html'          => array(
				'name'    => esc_html__( 'Copyright', 'thewebs' ),
				'section' => 'thewebs_customizer_footer_html',
			),
			'footer-widget1' => array(
				'name'    => esc_html__( 'Widget 1', 'thewebs' ),
				'section' => 'sidebar-widgets-footer1',
			),
			'footer-widget2' => array(
				'name'    => esc_html__( 'Widget 2', 'thewebs' ),
				'section' => 'sidebar-widgets-footer2',
			),
			'footer-widget3' => array(
				'name'    => esc_html__( 'Widget 3', 'thewebs' ),
				'section' => 'sidebar-widgets-footer3',
			),
			'footer-widget4' => array(
				'name'    => esc_html__( 'Widget 4', 'thewebs' ),
				'section' => 'sidebar-widgets-footer4',
			),
			'footer-widget5' => array(
				'name'    => esc_html__( 'Widget 5', 'thewebs' ),
				'section' => 'sidebar-widgets-footer5',
			),
			'footer-widget6' => array(
				'name'    => esc_html__( 'Widget 6', 'thewebs' ),
				'section' => 'sidebar-widgets-footer6',
			),
		),
		'input_attrs'  => array(
			'group' => 'footer_items',
			'rows'  => array( 'top', 'middle', 'bottom' ),
			'zones' => array(
				'top' => array(
					'top_1' => esc_html__( 'Top - 1', 'thewebs' ),
					'top_2' => esc_html__( 'Top - 2', 'thewebs' ),
					'top_3' => esc_html__( 'Top - 3', 'thewebs' ),
					'top_4' => esc_html__( 'Top - 4', 'thewebs' ),
					'top_5' => esc_html__( 'Top - 5', 'thewebs' ),
				),
				'middle' => array(
					'middle_1' => esc_html__( 'Middle - 1', 'thewebs' ),
					'middle_2' => esc_html__( 'Middle - 2', 'thewebs' ),
					'middle_3' => esc_html__( 'Middle - 3', 'thewebs' ),
					'middle_4' => esc_html__( 'Middle - 4', 'thewebs' ),
					'middle_5' => esc_html__( 'Middle - 5', 'thewebs' ),
				),
				'bottom' => array(
					'bottom_1' => esc_html__( 'Bottom - 1', 'thewebs' ),
					'bottom_2' => esc_html__( 'Bottom - 2', 'thewebs' ),
					'bottom_3' => esc_html__( 'Bottom - 3', 'thewebs' ),
					'bottom_4' => esc_html__( 'Bottom - 4', 'thewebs' ),
					'bottom_5' => esc_html__( 'Bottom - 5', 'thewebs' ),
				),
			),
		),
	),
	'footer_tab_settings' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'footer_layout',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_tabs,
	),
	'footer_available_items' => array(
		'control_type' => 'thewebs_available_control',
		'section'      => 'footer_layout',
		'settings'     => false,
		'input_attrs'  => array(
			'group'  => 'footer_items',
			'zones'  => array( 'top', 'middle', 'bottom' ),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'footer_wrap_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'footer_layout',
		'label'        => esc_html__( 'Footer Background', 'thewebs' ),
		'default'      => thewebs()->default( 'footer_wrap_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#colophon',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Footer Background', 'thewebs' ),
		),
	),
	'enable_footer_on_bottom' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'footer_layout',
		'default'      => thewebs()->default( 'enable_footer_on_bottom' ),
		'label'        => esc_html__( 'Keep footer on bottom of screen', 'thewebs' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
	),
);

Theme_Customizer::add_settings( $settings );

