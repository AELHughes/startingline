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
<div class="thewebs-build-tabs nav-tab-wrapper wp-clearfix">
	<a href="#" class="nav-tab preview-desktop thewebs-build-tabs-button" data-device="desktop">
		<span class="dashicons dashicons-desktop"></span>
		<span><?php esc_html_e( 'Desktop', 'thewebs' ); ?></span>
	</a>
	<a href="#" class="nav-tab preview-tablet preview-mobile thewebs-build-tabs-button" data-device="tablet">
		<span class="dashicons dashicons-smartphone"></span>
		<span><?php esc_html_e( 'Tablet / Mobile', 'thewebs' ); ?></span>
	</a>
</div>
<span class="button button-secondary thewebs-builder-hide-button thewebs-builder-tab-toggle"><span class="dashicons dashicons-no"></span><?php esc_html_e( 'Hide', 'thewebs' ); ?></span>
<span class="button button-secondary thewebs-builder-show-button thewebs-builder-tab-toggle"><span class="dashicons dashicons-edit"></span><?php esc_html_e( 'Header Builder', 'thewebs' ); ?></span>
<?php
$builder_tabs = ob_get_clean();
ob_start();
?>
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
	'header_builder' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'header_builder',
		'settings'     => false,
		'description'  => $builder_tabs,
	),
	'header_desktop_items' => array(
		'control_type' => 'thewebs_builder_control',
		'section'      => 'header_builder',
		'default'      => thewebs()->default( 'header_desktop_items' ),
		'context'      => array(
			array(
				'setting' => '__device',
				'value'   => 'desktop',
			),
		),
		'partial'      => array(
			'selector'            => '#masthead',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\header_markup',
		),
		'choices'      => array(
			'logo'          => array(
				'name'    => esc_html__( 'Logo', 'thewebs' ),
				'section' => 'title_tagline',
			),
			'navigation'          => array(
				'name'    => esc_html__( 'Primary Navigation', 'thewebs' ),
				'section' => 'thewebs_customizer_primary_navigation',
			),
			'navigation-2'        => array(
				'name'    => esc_html__( 'Secondary Navigation', 'thewebs' ),
				'section' => 'thewebs_customizer_secondary_navigation',
			),
			'search' => array(
				'name'    => esc_html__( 'Search', 'thewebs' ),
				'section' => 'thewebs_customizer_header_search',
			),
			'button'        => array(
				'name'    => esc_html__( 'Button', 'thewebs' ),
				'section' => 'thewebs_customizer_header_button',
			),
			'social'        => array(
				'name'    => esc_html__( 'Social', 'thewebs' ),
				'section' => 'thewebs_customizer_header_social',
			),
			'html'          => array(
				'name'    => esc_html__( 'HTML', 'thewebs' ),
				'section' => 'thewebs_customizer_header_html',
			),
		),
		'input_attrs'  => array(
			'group' => 'header_desktop_items',
			'rows'  => array( 'top', 'main', 'bottom' ),
			'zones' => array(
				'top' => array(
					'top_left'         => is_rtl() ? esc_html__( 'Top - Right', 'thewebs' ) : esc_html__( 'Top - Left', 'thewebs' ),
					'top_left_center'  => is_rtl() ? esc_html__( 'Top - Right Center', 'thewebs' ) : esc_html__( 'Top - Left Center', 'thewebs' ),
					'top_center'       => esc_html__( 'Top - Center', 'thewebs' ),
					'top_right_center' => is_rtl() ? esc_html__( 'Top - Left Center', 'thewebs' ) : esc_html__( 'Top - Right Center', 'thewebs' ),
					'top_right'        => is_rtl() ? esc_html__( 'Top - Left', 'thewebs' ) : esc_html__( 'Top - Right', 'thewebs' ),
				),
				'main' => array(
					'main_left'         => is_rtl() ? esc_html__( 'Main - Right', 'thewebs' ) : esc_html__( 'Main - Left', 'thewebs' ),
					'main_left_center'  => is_rtl() ? esc_html__( 'Main - Right Center', 'thewebs' ) : esc_html__( 'Main - Left Center', 'thewebs' ),
					'main_center'       => esc_html__( 'Main - Center', 'thewebs' ),
					'main_right_center' => is_rtl() ? esc_html__( 'Main - Left Center', 'thewebs' ) : esc_html__( 'Main - Right Center', 'thewebs' ),
					'main_right'        => is_rtl() ? esc_html__( 'Main - Left', 'thewebs' ) : esc_html__( 'Main - Right', 'thewebs' ),
				),
				'bottom' => array(
					'bottom_left'         => is_rtl() ? esc_html__( 'Bottom - Right', 'thewebs' ) : esc_html__( 'Bottom - Left', 'thewebs' ),
					'bottom_left_center'  => is_rtl() ? esc_html__( 'Bottom - Right Center', 'thewebs' ) : esc_html__( 'Bottom - Left Center', 'thewebs' ),
					'bottom_center'       => esc_html__( 'Bottom - Center', 'thewebs' ),
					'bottom_right_center' => is_rtl() ? esc_html__( 'Bottom - Left Center', 'thewebs' ) : esc_html__( 'Bottom - Right Center', 'thewebs' ),
					'bottom_right'        => is_rtl() ? esc_html__( 'Bottom - Left', 'thewebs' ) : esc_html__( 'Bottom - Right', 'thewebs' ),
				),
			),
		),
	),
	'header_tab_settings' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_tabs,
	),
	'header_desktop_available_items' => array(
		'control_type' => 'thewebs_available_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'input_attrs'  => array(
			'group'  => 'header_desktop_items',
			'zones'  => array( 'top', 'main', 'bottom' ),
		),
		'context'      => array(
			array(
				'setting' => '__device',
				'value'   => 'desktop',
			),
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'header_mobile_items' => array(
		'control_type' => 'thewebs_builder_control',
		'section'      => 'header_builder',
		'transport'    => 'refresh',
		'default'      => thewebs()->default( 'header_mobile_items' ),
		'context'      => array(
			array(
				'setting'  => '__device',
				'operator' => 'in',
				'value'    => array( 'tablet', 'mobile' ),
			),
		),
		'partial'      => array(
			'selector'            => '#mobile-header',
			'container_inclusive' => true,
			'render_callback'     => 'Thewebs\mobile_header',
		),
		'choices'      => array(
			'mobile-logo'          => array(
				'name'    => esc_html__( 'Logo', 'thewebs' ),
				'section' => 'title_tagline',
			),
			'mobile-navigation' => array(
				'name'    => esc_html__( 'Mobile Navigation', 'thewebs' ),
				'section' => 'thewebs_customizer_mobile_navigation',
			),
			// 'mobile-navigation2'          => array(
			// 	'name'    => esc_html__( 'Horizontal Navigation', 'thewebs' ),
			// 	'section' => 'mobile_horizontal_navigation',
			// ),
			'search' => array(
				'name'    => esc_html__( 'Search Toggle', 'thewebs' ),
				'section' => 'thewebs_customizer_header_search',
			),
			'mobile-button'        => array(
				'name'    => esc_html__( 'Button', 'thewebs' ),
				'section' => 'thewebs_customizer_mobile_button',
			),
			'mobile-social'        => array(
				'name'    => esc_html__( 'Social', 'thewebs' ),
				'section' => 'thewebs_customizer_mobile_social',
			),
			'mobile-html'          => array(
				'name'    => esc_html__( 'HTML', 'thewebs' ),
				'section' => 'thewebs_customizer_mobile_html',
			),
			'popup-toggle'          => array(
				'name'    => esc_html__( 'Trigger', 'thewebs' ),
				'section' => 'thewebs_customizer_mobile_trigger',
			),
		),
		'input_attrs'  => array(
			'group' => 'header_mobile_items',
			'rows'  => array( 'popup', 'top', 'main', 'bottom' ),
			'zones' => array(
				'popup' => array(
					'popup_content' => esc_html__( 'Popup Content', 'thewebs' ),
				),
				'top' => array(
					'top_left'   => is_rtl() ? esc_html__( 'Top - Right', 'thewebs' ) : esc_html__( 'Top - Left', 'thewebs' ),
					'top_center' => esc_html__( 'Top - Center', 'thewebs' ),
					'top_right'  => is_rtl() ? esc_html__( 'Top - Left', 'thewebs' ) : esc_html__( 'Top - Right', 'thewebs' ),
				),
				'main' => array(
					'main_left'   => is_rtl() ? esc_html__( 'Main - Right', 'thewebs' ) : esc_html__( 'Main - Left', 'thewebs' ),
					'main_center' => esc_html__( 'Main - Center', 'thewebs' ),
					'main_right'  => is_rtl() ? esc_html__( 'Main - Left', 'thewebs' ) : esc_html__( 'Main - Right', 'thewebs' ),
				),
				'bottom' => array(
					'bottom_left'   => is_rtl() ? esc_html__( 'Bottom - Right', 'thewebs' ) : esc_html__( 'Bottom - Left', 'thewebs' ),
					'bottom_center' => esc_html__( 'Bottom - Center', 'thewebs' ),
					'bottom_right'  => is_rtl() ? esc_html__( 'Bottom - Left', 'thewebs' ) : esc_html__( 'Bottom - Right', 'thewebs' ),
				),
			),
		),
	),
	'header_mobile_available_items' => array(
		'control_type' => 'thewebs_available_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'input_attrs'  => array(
			'group'  => 'header_mobile_items',
			'zones'  => array( 'popup', 'top', 'main', 'bottom' ),
		),
		'context'      => array(
			array(
				'setting'  => '__device',
				'operator' => 'in',
				'value'    => array( 'tablet', 'mobile' ),
			),
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'header_transparent_link' => array(
		'control_type' => 'thewebs_focus_button_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'priority'     => 20,
		'label'        => esc_html__( 'Transparent Header', 'thewebs' ),
		'input_attrs'  => array(
			'section' => 'thewebs_customizer_transparent_header',
		),
	),
	'header_sticky_link' => array(
		'control_type' => 'thewebs_focus_button_control',
		'section'      => 'header_layout',
		'settings'     => false,
		'priority'     => 20,
		'label'        => esc_html__( 'Sticky Header', 'thewebs' ),
		'input_attrs'  => array(
			'section' => 'thewebs_customizer_header_sticky',
		),
	),
	'header_wrap_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'header_layout',
		'label'        => esc_html__( 'Header Background', 'thewebs' ),
		'default'      => thewebs()->default( 'header_wrap_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#masthead',
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
			'tooltip'  => __( 'Header Background', 'thewebs' ),
		),
	),
	'header_mobile_switch' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'header_layout',
		'transport'    => 'refresh',
		'label'        => esc_html__( 'Screen size to switch to mobile header', 'thewebs' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'design',
			),
		),
		'default'      => thewebs()->default( 'header_mobile_switch' ),
		'input_attrs'  => array(
			'min'        => array(
				'px'  => 0,
			),
			'max'        => array(
				'px'  => 4000,
			),
			'step'       => array(
				'px'  => 1,
			),
			'units'      => array( 'px' ),
			'responsive' => false,
		),
	),
);

Theme_Customizer::add_settings( $settings );

