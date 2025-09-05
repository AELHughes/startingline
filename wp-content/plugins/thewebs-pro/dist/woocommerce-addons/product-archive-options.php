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
		'info_product_custom_shop_page' => array(
			'control_type' => 'thewebs_title_control',
			'priority'     => 11,
			'section'      => 'woocommerce_product_catalog',
			'label'        => esc_html__( 'Custom Shop Page', 'thewebs-pro' ),
			'settings'     => false,
		),
		'product_archive_shop_custom' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'woocommerce_product_catalog',
			'priority'     => 11,
			'default'      => thewebs()->default( 'product_archive_shop_custom' ),
			'label'        => esc_html__( 'Custom Content For Shop Page?', 'thewebs-pro' ),
			'input_attrs'  => array(
				'help' => esc_html__( 'This will use the page content of your shop page instead of the WoooCommerce archive loop.', 'thewebs-pro' ),
			),
			'transport'    => 'refresh',
		),
		'info_product_archive_shop_active_filter' => array(
			'control_type' => 'thewebs_title_control',
			'priority'     => 12,
			'section'      => 'woocommerce_product_catalog',
			'label'        => esc_html__( 'Archive Active Filters', 'thewebs-pro' ),
			'settings'     => false,
		),
		'product_archive_shop_filter_active_top' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'woocommerce_product_catalog',
			'priority'     => 12,
			'default'      => thewebs()->default( 'product_archive_shop_filter_active_top' ),
			'label'        => esc_html__( 'Add Active Filters to top of Shop?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'product_archive_shop_filter_active_remove_all' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'woocommerce_product_catalog',
			'priority'     => 12,
			'default'      => thewebs()->default( 'product_archive_shop_filter_active_remove_all' ),
			'label'        => esc_html__( 'Show Button to Remove all Filters?', 'thewebs-pro' ),
			'transport'    => 'refresh',
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_active_top',
					'operator'   => '=',
					'value'      => true,
				),
			),
		),
		'info_product_archive_shop_filter' => array(
			'control_type' => 'thewebs_title_control',
			'priority'     => 12,
			'section'      => 'woocommerce_product_catalog',
			'label'        => esc_html__( 'Off Canvas Sidebar', 'thewebs-pro' ),
			'settings'     => false,
		),
		'product_archive_shop_filter_popout' => array(
			'control_type' => 'thewebs_switch_control',
			'section'      => 'woocommerce_product_catalog',
			'priority'     => 12,
			'default'      => thewebs()->default( 'product_archive_shop_filter_popout' ),
			'label'        => esc_html__( 'Add Off Canvas Widget Area?', 'thewebs-pro' ),
			'transport'    => 'refresh',
		),
		'product_archive_shop_filter_icon' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'woocommerce_product_catalog',
			'default'      => thewebs()->default( 'product_archive_shop_filter_icon' ),
			'label'        => esc_html__( 'Toggle Icon', 'thewebs-pro' ),
			'priority'     => 12,
			'partial'      => array(
				'selector'            => '.filter-toggle-icon',
				'container_inclusive' => false,
				'render_callback'     => 'Thewebs_Pro\shop_filter_toggle_icon',
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'menu3' => array(
						'icon' => 'menu3',
					),
					'menu' => array(
						'icon' => 'menu',
					),
					'listFilter' => array(
						'icon' => 'listFilter',
					),
					'listFilterAlt' => array(
						'icon' => 'listFilterAlt',
					),
					'none' => array(
						'name' => 'none',
					),
				),
				'responsive' => false,
			),
		),
		'product_archive_shop_filter_label' => array(
			'control_type' => 'thewebs_text_control',
			'sanitize'     => 'sanitize_text_field',
			'section'      => 'woocommerce_product_catalog',
			'default'      => thewebs()->default( 'product_archive_shop_filter_label' ),
			'label'        => esc_html__( 'Toggle Label', 'thewebs-pro' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'html',
					'selector' => '.filter-toggle-label',
					'pattern'  => '$',
					'key'      => '',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
		),
		'info_product_archive_shop_filter_design' => array(
			'control_type' => 'thewebs_title_control',
			'priority'     => 12,
			'section'      => 'woocommerce_product_catalog_design',
			'label'        => esc_html__( 'Off Canvas Sidebar', 'thewebs-pro' ),
			'settings'     => false,
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
		),
		'product_archive_shop_filter_style' => array(
			'control_type' => 'thewebs_radio_icon_control',
			'section'      => 'woocommerce_product_catalog_design',
			'default'      => thewebs()->default( 'product_archive_shop_filter_style' ),
			'label'        => esc_html__( 'Toggle Style', 'thewebs-pro' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'class',
					'selector' => '.filter-toggle-open',
					'pattern'  => 'filter-toggle-style-$',
					'key'      => '',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'layout' => array(
					'default' => array(
						'name' => __( 'Default', 'thewebs-pro' ),
					),
					'bordered' => array(
						'name' => __( 'Bordered', 'thewebs-pro' ),
					),
				),
				'responsive' => false,
			),
		),
		'product_archive_shop_filter_border' => array(
			'control_type' => 'thewebs_border_control',
			'section'      => 'woocommerce_product_catalog_design',
			'priority'     => 12,
			'label'        => esc_html__( 'Toggle Border', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'product_archive_shop_filter_border' ),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_style',
					'operator'   => 'sub_object_contains',
					'sub_key'    => 'layout',
					'responsive' => false,
					'value'      => 'bordered',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'live_method'     => array(
				array(
					'type'     => 'css_border',
					'selector' => '.filter-toggle-open-container .filter-toggle-open.filter-toggle-style-bordered',
					'pattern'  => '$',
					'property' => 'border',
					'key'      => 'border',
				),
			),
			'input_attrs'  => array(
				'color'      => false,
				'responsive' => false,
			),
		),
		'product_archive_shop_filter_icon_size' => array(
			'control_type' => 'thewebs_range_control',
			'section'      => 'woocommerce_product_catalog_design',
			'label'        => esc_html__( 'Icon Size', 'thewebs-pro' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open .filter-toggle-icon',
					'property' => 'font-size',
					'pattern'  => '$',
					'key'      => 'size',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'default'      => thewebs()->default( 'product_archive_shop_filter_icon_size' ),
			'input_attrs'  => array(
				'min'        => array(
					'px'  => 0,
					'em'  => 0,
					'rem' => 0,
				),
				'max'        => array(
					'px'  => 100,
					'em'  => 12,
					'rem' => 12,
				),
				'step'       => array(
					'px'  => 1,
					'em'  => 0.01,
					'rem' => 0.01,
				),
				'units'      => array( 'px', 'em', 'rem' ),
				'responsive' => false,
			),
		),
		'product_archive_shop_filter_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'woocommerce_product_catalog_design',
			'label'        => esc_html__( 'Trigger Colors', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'product_archive_shop_filter_color' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open:hover, .filter-toggle-open-container .filter-toggle-open:focus',
					'property' => 'color',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs-pro' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs-pro' ),
						'palette' => true,
					),
				),
			),
		),
		'product_archive_shop_filter_background' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'woocommerce_product_catalog_design',
			'label'        => esc_html__( 'Trigger Background', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'product_archive_shop_filter_background' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open:hover, .filter-toggle-open-container .filter-toggle-open:focus',
					'property' => 'background',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Background', 'thewebs-pro' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Background', 'thewebs-pro' ),
						'palette' => true,
					),
				),
			),
		),
		'product_archive_shop_filter_border_color' => array(
			'control_type' => 'thewebs_color_control',
			'section'      => 'woocommerce_product_catalog_design',
			'label'        => esc_html__( 'Trigger Colors', 'thewebs-pro' ),
			'default'      => thewebs()->default( 'product_archive_shop_filter_border_color' ),
			'priority'     => 12,
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open',
					'property' => 'border-color',
					'pattern'  => '$',
					'key'      => 'color',
				),
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open:hover, .filter-toggle-open-container .filter-toggle-open:focus',
					'property' => 'border-color',
					'pattern'  => '$',
					'key'      => 'hover',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'colors' => array(
					'color' => array(
						'tooltip' => __( 'Initial Color', 'thewebs-pro' ),
						'palette' => true,
					),
					'hover' => array(
						'tooltip' => __( 'Hover Color', 'thewebs-pro' ),
						'palette' => true,
					),
				),
			),
		),
		'product_archive_shop_filter_typography' => array(
			'control_type' => 'thewebs_typography_control',
			'section'      => 'woocommerce_product_catalog_design',
			'priority'     => 12,
			'label'        => esc_html__( 'Trigger Font', 'thewebs-pro' ),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
				array(
					'setting'  => 'product_archive_shop_filter_label',
					'operator' => '!empty',
					'value'    => '',
				),
			),
			'default'      => thewebs()->default( 'product_archive_shop_filter_typography' ),
			'live_method'     => array(
				array(
					'type'     => 'css_typography',
					'selector' => '.filter-toggle-open-container .filter-toggle-open',
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
				'id'      => 'product_archive_shop_filter_typography',
				'options' => 'no-color',
			),
		),
		'product_archive_shop_filter_padding' => array(
			'control_type' => 'thewebs_measure_control',
			'section'      => 'woocommerce_product_catalog_design',
			'priority'     => 12,
			'default'      => thewebs()->default( 'product_archive_shop_filter_padding' ),
			'label'        => esc_html__( 'Trigger Padding', 'thewebs-pro' ),
			'live_method'     => array(
				array(
					'type'     => 'css',
					'selector' => '.filter-toggle-open-container .filter-toggle-open',
					'property' => 'padding',
					'pattern'  => '$',
					'key'      => 'measure',
				),
			),
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'input_attrs'  => array(
				'responsive' => false,
			),
		),
		'product_filter_widget_link' => array(
			'control_type' => 'thewebs_focus_button_control',
			'section'      => 'woocommerce_product_catalog',
			'settings'     => false,
			'priority'     => 12,
			'context'      => array(
				array(
					'setting'    => 'product_archive_shop_filter_popout',
					'operator'   => '=',
					'value'      => true,
				),
			),
			'label'        => esc_html__( 'Add Widget Items', 'thewebs-pro' ),
			'input_attrs'  => array(
				'section' => 'sidebar-widgets-product-filter',
			),
		),
	)
);

ob_start(); ?>
<div class="thewebs-compontent-tabs nav-tab-wrapper wp-clearfix">
	<a href="#" class="nav-tab thewebs-general-tab thewebs-compontent-tabs-button nav-tab-active" data-tab="general">
		<span><?php esc_html_e( 'General', 'thewebs-pro' ); ?></span>
	</a>
</div>
<?php
$compontent_tabs = ob_get_clean();

$widget_settings = array(
	'product_filter_widget_breaker' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'sidebar-widgets-product-filter',
		'settings'     => false,
		'priority'     => 5,
		'description'  => $compontent_tabs,
	),
	'product_filter_widget_title' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Widget Titles', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'product_filter_widget_title' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets .widget-title',
				'pattern'  => array(
					'desktop' => '$',
					'tablet'  => '$',
					'mobile'  => '$',
				),
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'id' => 'product_filter_widget_title',
		),
	),
	'product_filter_widget_content' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Widget Content', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'product_filter_widget_content' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets',
				'pattern'  => array(
					'desktop' => '$',
					'tablet'  => '$',
					'mobile'  => '$',
				),
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'id' => 'product_filter_widget_content',
		),
	),
	'product_filter_widget_link_colors' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Link Colors', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'product_filter_widget_link_colors' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets a',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets a:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Initial Color', 'thewebs-pro' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Hover Color', 'thewebs-pro' ),
					'palette' => true,
				),
			),
		),
	),
	'product_filter_widget_link_style' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'sidebar-widgets-product-filter',
		'default'      => thewebs()->default( 'product_filter_widget_link_style' ),
		'label'        => esc_html__( 'Link Style', 'thewebs-pro' ),
		'input_attrs'  => array(
			'options' => array(
				'normal' => array(
					'name' => __( 'Underline', 'thewebs-pro' ),
				),
				'plain' => array(
					'name' => __( 'No Underline', 'thewebs-pro' ),
				),
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets',
				'pattern'  => 'inner-link-style-$',
				'key'      => '',
			),
		),
	),
	'product_filter_widget_padding' => array(
		'control_type' => 'thewebs_measure_control',
		'section'      => 'sidebar-widgets-product-filter',
		'default'      => thewebs()->default( 'product_filter_widget_padding' ),
		'label'        => esc_html__( 'Padding', 'thewebs-pro' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer .drawer-inner .product-filter-widgets',
				'property' => 'padding',
				'pattern'  => '$',
				'key'      => 'measure',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'responsive' => false,
		),
	),
	'info_product_filter_widget_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Popup Area Settings', 'thewebs-pro' ),
		'settings'     => false,
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
	),
	'product_filter_widget_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sidebar-widgets-product-filter',
		'default'      => thewebs()->default( 'product_filter_widget_layout' ),
		'label'        => esc_html__( 'Layout', 'thewebs-pro' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#filter-drawer',
				'pattern'  => 'popup-drawer-layout-$',
				'key'      => '',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'fullwidth' => array(
					'tooltip' => __( 'Reveal as Fullwidth', 'thewebs-pro' ),
					'name'    => __( 'Fullwidth', 'thewebs-pro' ),
					'icon'    => '',
				),
				'sidepanel' => array(
					'tooltip' => __( 'Reveal as Side Panel', 'thewebs-pro' ),
					'name'    => __( 'Side Panel', 'thewebs-pro' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'product_filter_widget_side' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sidebar-widgets-product-filter',
		'default'      => thewebs()->default( 'product_filter_widget_side' ),
		'label'        => esc_html__( 'Slide-Out Side', 'thewebs-pro' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
			array(
				'setting'    => 'product_filter_widget_layout',
				'operator'   => 'sub_object_contains',
				'sub_key'    => 'layout',
				'responsive' => false,
				'value'      => 'sidepanel',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '#filter-drawer',
				'pattern'  => 'popup-drawer-side-$',
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'left' => array(
					'tooltip' => __( 'Reveal from Left', 'thewebs-pro' ),
					'name'    => __( 'Left', 'thewebs-pro' ),
					'icon'    => '',
				),
				'right' => array(
					'tooltip' => __( 'Reveal from Right', 'thewebs-pro' ),
					'name'    => __( 'Right', 'thewebs-pro' ),
					'icon'    => '',
				),
			),
			'responsive' => false,
		),
	),
	'product_filter_widget_pop_width' => array(
		'control_type' => 'thewebs_range_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Popup Content Max Width', 'thewebs-pro' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer.popup-drawer-layout-fullwidth .drawer-content .product-filter-widgets, #filter-drawer.popup-drawer-layout-sidepanel .drawer-inner',
				'property' => 'max-width',
				'pattern'  => '$',
				'key'      => 'size',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'default'      => thewebs()->default( 'product_filter_widget_pop_width' ),
		'input_attrs'  => array(
			'min'        => array(
				'px' => 100,
				'%'  => 10,
			),
			'max'        => array(
				'px' => 1000,
				'%'  => 100,
			),
			'step'       => array(
				'px' => 1,
				'%'  => 1,
			),
			'units'      => array( 'px', '%' ),
			'responsive' => false,
		),
	),
	'product_filter_widget_pop_background' => array(
		'control_type' => 'thewebs_background_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Popup Background', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'product_filter_widget_pop_background' ),
		'live_method'     => array(
			array(
				'type'     => 'css_background',
				'selector' => '#filter-drawer .drawer-inner',
				'property' => 'background',
				'pattern'  => '$',
				'key'      => 'base',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'tooltip'  => __( 'Popup Background', 'thewebs-pro' ),
		),
	),
	'product_filter_widget_close_color' => array(
		'control_type' => 'thewebs_color_control',
		'section'      => 'sidebar-widgets-product-filter',
		'label'        => esc_html__( 'Close Toggle Colors', 'thewebs-pro' ),
		'default'      => thewebs()->default( 'product_filter_widget_close_color' ),
		'live_method'     => array(
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer .drawer-header .drawer-toggle',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'color',
			),
			array(
				'type'     => 'css',
				'selector' => '#filter-drawer .drawer-header .drawer-toggle:hover',
				'property' => 'color',
				'pattern'  => '$',
				'key'      => 'hover',
			),
		),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'input_attrs'  => array(
			'colors' => array(
				'color' => array(
					'tooltip' => __( 'Initial Color', 'thewebs-pro' ),
					'palette' => true,
				),
				'hover' => array(
					'tooltip' => __( 'Hover Color', 'thewebs-pro' ),
					'palette' => true,
				),
			),
		),
	),
);
Theme_Customizer::add_settings( $widget_settings );
