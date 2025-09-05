<?php
/**
 * Header Main Row Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$all_post_types    = thewebs()->get_post_types_objects();
$extras_post_types = array();
$add_extras        = false;
foreach ( $all_post_types as $post_type_item ) {
	$post_type_name  = $post_type_item->name;
	$post_type_label = $post_type_item->label;
	$ignore_type     = thewebs()->get_post_types_to_ignore();
	if ( ! in_array( $post_type_name, $ignore_type, true ) ) {
		$taxonomies = get_object_taxonomies( $post_type_name, 'objects' );
		$taxs = array();
		foreach ( $taxonomies as $term_slug => $term ) {
			if ( ! $term->public || ! $term->show_ui ) {
				continue;
			}
			$taxs[ $term_slug ] = $term->label;
		}
		$settings = array(
			$post_type_name . '_layout_tabs' => array(
				'control_type' => 'thewebs_tab_control',
				'section'      => $post_type_name . '_layout',
				'settings'     => false,
				'priority'     => 1,
				'input_attrs'  => array(
					'general' => array(
						'label'  => __( 'General', 'thewebs' ),
						'target' => $post_type_name . '_layout',
					),
					'design' => array(
						'label'  => __( 'Design', 'thewebs' ),
						'target' =>  $post_type_name . '_layout_design',
					),
					'active' => 'general',
				),
			),
			$post_type_name . '_layout_tabs_design' => array(
				'control_type' => 'thewebs_tab_control',
				'section'      =>  $post_type_name . '_layout_design',
				'settings'     => false,
				'priority'     => 1,
				'input_attrs'  => array(
					'general' => array(
						'label'  => __( 'General', 'thewebs' ),
						'target' => $post_type_name . '_layout',
					),
					'design' => array(
						'label'  => __( 'Design', 'thewebs' ),
						'target' => $post_type_name . '_layout_design',
					),
					'active' => 'design',
				),
			),
			'info_' . $post_type_name . '_title' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_layout',
				'priority'     => 2,
				'label'        => $post_type_label . ' ' . esc_html__( 'Title', 'thewebs' ),
				'settings'     => false,
			),
			'info_' . $post_type_name . '_title_design' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_layout_design',
				'priority'     => 2,
				'label'        => $post_type_label . ' ' . esc_html__( 'Title', 'thewebs' ),
				'settings'     => false,
			),
			$post_type_name . '_title' => array(
				'control_type' => 'thewebs_switch_control',
				'sanitize'     => 'thewebs_sanitize_toggle',
				'section'      => $post_type_name . '_layout',
				'priority'     => 3,
				'default'      => thewebs()->default( $post_type_name . '_title', true ),
				'label'        => esc_html__( 'Show Title?', 'thewebs' ),
				'transport'    => 'refresh',
			),
			$post_type_name . '_title_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => $post_type_label . ' ' . esc_html__( 'Title Layout', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_title_layout', 'normal' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'normal' => array(
							'tooltip' => __( 'In Content', 'thewebs' ),
							'icon'    => 'incontent',
						),
						'above' => array(
							'tooltip' => __( 'Above Content', 'thewebs' ),
							'icon'    => 'abovecontent',
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-two-col',
				),
			),
			$post_type_name . '_title_inner_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_title_inner_layout', 'standard' ),
				'label'        => esc_html__( 'Container Width', 'thewebs' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => '.' . $post_type_name . '-hero-section',
						'pattern'  => 'entry-hero-layout-$',
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
					'responsive' => false,
				),
			),
			$post_type_name . '_title_align' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => $post_type_label . ' ' . esc_html__( 'Title Align', 'thewebs' ),
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_title_align' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => '.' . $post_type_name . '-title',
						'pattern'  => array(
							'desktop' => 'title-align-$',
							'tablet'  => 'title-tablet-align-$',
							'mobile'  => 'title-mobile-align-$',
						),
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'left' => array(
							'tooltip'  => __( 'Left Align Title', 'thewebs' ),
							'dashicon' => 'editor-alignleft',
						),
						'center' => array(
							'tooltip'  => __( 'Center Align Title', 'thewebs' ),
							'dashicon' => 'editor-aligncenter',
						),
						'right' => array(
							'tooltip'  => __( 'Right Align Title', 'thewebs' ),
							'dashicon' => 'editor-alignright',
						),
					),
					'responsive' => true,
				),
			),
			$post_type_name . '_title_height' => array(
				'control_type' => 'thewebs_range_control',
				'section'      => $post_type_name . '_layout',
				'priority'     => 5,
				'label'        => esc_html__( 'Container Min Height', 'thewebs' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '#inner-wrap .' . $post_type_name . '-hero-section .entry-header',
						'property' => 'min-height',
						'pattern'  => '$',
						'key'      => 'size',
					),
				),
				'default'      => thewebs()->default( $post_type_name . '_title_height', array(
					'size' => array(
						'mobile'  => '',
						'tablet'  => '',
						'desktop' => '',
					),
					'unit' => array(
						'mobile'  => 'px',
						'tablet'  => 'px',
						'desktop' => 'px',
					),
				) ),
				'input_attrs'  => array(
					'min'     => array(
						'px'  => 10,
						'em'  => 1,
						'rem' => 1,
						'vh'  => 2,
					),
					'max'     => array(
						'px'  => 800,
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
			$post_type_name . '_title_elements' => array(
				'control_type' => 'thewebs_sorter_control',
				'section'      => $post_type_name . '_layout',
				'priority'     => 6,
				'default'      => array( 'title', 'breadcrumb', 'meta' ),
				'label'        => esc_html__( 'Title Elements', 'thewebs' ),
				'transport'    => 'refresh',
				'settings'     => array(
					'elements'   => $post_type_name . '_title_elements',
					'title'      => $post_type_name . '_title_element_title',
					'breadcrumb' => $post_type_name . '_title_element_breadcrumb',
					'categories' => $post_type_name . '_title_element_categories',
					'meta'       => $post_type_name . '_title_element_meta',
				),
				'input_attrs'  => array(
					'defaults' => array(
						'categories' => array(
							'enabled' => true,
							'style'   => 'normal',
							'divider' => 'vline',
							'taxonomy' => '',
						),
						'title'      => array(
							'enabled' => true,
						),
						'meta'       => array(
							'id'                     => 'meta',
							'enabled'                => false,
							'divider'                => 'dot',
							'author'                 => true,
							'authorImage'            => true,
							'authorEnableLabel'      => true,
							'authorLabel'            => '',
							'date'                   => true,
							'dateTime'               => false,
							'dateEnableLabel'        => false,
							'dateLabel'              => '',
							'dateUpdated'            => false,
							'dateUpdatedTime'        => false,
							'dateUpdatedDifferent'   => false,
							'dateUpdatedEnableLabel' => false,
							'dateUpdatedLabel'       => '',
							'comments'               => false,
							'commentsCondition'      => false,
						),
						'breadcrumb' => array(
							'enabled' => false,
							'show_title' => true,
						),
					),
					'group'      => $post_type_name . '_title_element',
					'taxonomies' => $taxs,
				),
			),
			$post_type_name . '_title_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => $post_type_label . ' ' . esc_html__( 'Title Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => 'inherit',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
					'color'   => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.wp-site-blocks .' . $post_type_name . '-title h1',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'             => $post_type_name . '_title_font',
					'headingInherit' => true,
				),
			),
			$post_type_name . '_title_category_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Category Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_category_color', array(
					'color' => '',
					'hover' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-taxonomies, .' . $post_type_name . '-title .entry-taxonomies a',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-taxonomies a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-taxonomies .category-style-pill a',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-taxonomies .category-style-pill a:hover',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_title_category_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Category Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_category_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => 'inherit',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.' . $post_type_name . '-title .entry-taxonomies, .' . $post_type_name . '-title .entry-taxonomies a',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'      => $post_type_name . '_title_category_font',
					'options' => 'no-color',
				),
			),
			$post_type_name . '_title_breadcrumb_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_breadcrumb_color', array(
					'color' => '',
					'hover' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .thewebs-breadcrumbs',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .thewebs-breadcrumbs a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_title_breadcrumb_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Breadcrumb Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_breadcrumb_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => 'inherit',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.' . $post_type_name . '-title .thewebs-breadcrumbs',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'      => $post_type_name . '_title_breadcrumb_font',
					'options' => 'no-color',
				),
			),
			$post_type_name . '_title_meta_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Meta Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_meta_color' ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-meta',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-title .entry-meta a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_title_meta_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Meta Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_meta_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => 'inherit',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.' . $post_type_name . '-title .entry-meta',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'      => $post_type_name . '_title_meta_font',
					'options' => 'no-color',
				),
			),
			$post_type_name . '_title_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => $post_type_label . ' ' . esc_html__( 'Title Background', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_background', array(
					'desktop' => array(
						'color' => '',
					),
				) ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css_background',
						'selector' => '#inner-wrap .page-hero-section .entry-hero-container-inner',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip'  => $post_type_name . ' ' . __( 'Title Background', 'thewebs' ),
				),
			),
			$post_type_name . '_title_featured_image' => array(
				'control_type' => 'thewebs_switch_control',
				'section'      => $post_type_name . '_layout_design',
				'default'      => thewebs()->default( $post_type_name . '_title_featured_image' ),
				'label'        => esc_html__( 'Use Featured Image for Background?', 'thewebs' ),
				'transport'    => 'refresh',
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
			),
			$post_type_name . '_title_overlay_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_overlay_color', array(
					'color' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-hero-section .hero-section-overlay',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'color',
					),
				),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
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
			$post_type_name . '_title_top_border' => array(
				'control_type' => 'thewebs_border_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Top Border', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_top_border' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css_border',
						'selector' => '.' . $post_type_name . '-hero-section .entry-hero-container-inner',
						'pattern'  => '$',
						'property' => 'border-top',
						'pattern'  => '$',
						'key'      => 'border',
					),
				),
			),
			$post_type_name . '_title_bottom_border' => array(
				'control_type' => 'thewebs_border_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Bottom Border', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_title_bottom_border' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css_border',
						'selector' => '.' . $post_type_name . '-hero-section .entry-hero-container-inner',
						'pattern'  => '$',
						'property' => 'border-bottom',
						'pattern'  => '$',
						'key'      => 'border',
					),
				),
			),
			'info_' . $post_type_name . '_layout' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_layout',
				'priority'     => 10,
				'label'        => $post_type_label . ' ' . esc_html__( 'Layout', 'thewebs' ),
				'settings'     => false,
			),
			'info_' . $post_type_name . '_layout_design' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_layout_design',
				'priority'     => 10,
				'label'        => $post_type_label . ' ' . esc_html__( 'Layout', 'thewebs' ),
				'settings'     => false,
			),
			$post_type_name . '_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => $post_type_label . ' ' . esc_html__( 'Layout', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_layout', 'normal' ),
				'input_attrs'  => array(
					'layout' => array(
						'normal' => array(
							'tooltip' => __( 'Normal', 'thewebs' ),
							'icon' => 'normal',
						),
						'narrow' => array(
							'tooltip' => __( 'Narrow', 'thewebs' ),
							'icon' => 'narrow',
						),
						'fullwidth' => array(
							'tooltip' => __( 'Fullwidth', 'thewebs' ),
							'icon' => 'fullwidth',
						),
						'left' => array(
							'tooltip' => __( 'Left Sidebar', 'thewebs' ),
							'icon' => 'leftsidebar',
						),
						'right' => array(
							'tooltip' => __( 'Right Sidebar', 'thewebs' ),
							'icon' => 'rightsidebar',
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-three-col',
				),
			),
			$post_type_name . '_sidebar_id' => array(
				'control_type' => 'thewebs_select_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Default Sidebar', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_sidebar_id' ),
				'input_attrs'  => array(
					'options' => thewebs()->sidebar_options(),
				),
			),
			$post_type_name . '_content_style' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Content Style', 'thewebs' ),
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_content_style', 'boxed' ),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => 'body.' . str_replace( '_', '-', $post_type_name ),
						'pattern'  => 'content-style-$',
						'key'      => '',
					),
					array(
						'type'     => 'class',
						'selector' => 'body.single-' . ( 'give_forms' === $post_type_name ? $post_type_name : str_replace( '_', '-', $post_type_name ) ),
						'pattern'  => 'content-style-$',
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'boxed' => array(
							'tooltip' => __( 'Boxed', 'thewebs' ),
							'icon' => 'boxed',
						),
						'unboxed' => array(
							'tooltip' => __( 'Unboxed', 'thewebs' ),
							'icon' => 'narrow',
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-two-col',
				),
			),
			$post_type_name . '_vertical_padding' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_vertical_padding', 'show' ),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => 'body.' . str_replace( '_', '-', $post_type_name ),
						'pattern'  => 'content-vertical-padding-$',
						'key'      => '',
					),
					array(
						'type'     => 'class',
						'selector' => 'body.single-' . ( 'give_forms' === $post_type_name ? $post_type_name : str_replace( '_', '-', $post_type_name ) ),
						'pattern'  => 'content-vertical-padding-$',
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'show' => array(
							'name' => __( 'Enable', 'thewebs' ),
						),
						'hide' => array(
							'name' => __( 'Disable', 'thewebs' ),
						),
						'top' => array(
							'name' => __( 'Top Only', 'thewebs' ),
						),
						'bottom' => array(
							'name' => __( 'Bottom Only', 'thewebs' ),
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-two-grid',
				),
			),
			$post_type_name . '_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Site Background', 'thewebs' ),
				'default'      => thewebs()->default( 'site_background' ),
				'live_method'     => array(
					array(
						'type'     => 'css_background',
						'selector' => 'body.single-' . str_replace( '_', '-', $post_type_name ),
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
					array(
						'type'     => 'css_background',
						'selector' => 'body.' . ( 'give_forms' === $post_type_name ? $post_type_name : str_replace( '_', '-', $post_type_name ) ),
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip' => $post_type_label . ' ' . __( 'Background', 'thewebs' ),
				),
			),
			$post_type_name . '_content_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_layout_design',
				'label'        => esc_html__( 'Content Background', 'thewebs' ),
				'default'      => thewebs()->default( 'content_background' ),
				'live_method'  => array(
					array(
						'type'     => 'css_background',
						'selector' => 'body.single-' . ( 'give_forms' === $post_type_name ? $post_type_name : str_replace( '_', '-', $post_type_name ) ) . ' .content-bg, body.single' . ( 'give_forms' === $post_type_name ? $post_type_name : str_replace( '_', '-', $post_type_name ) ) . '.content-style-unboxed .site',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip' => $post_type_label . ' ' . __( 'Content Background', 'thewebs' ),
				),
			),
		);
		$add_extras = false;
		$extras     = array();
		if ( post_type_supports( $post_type_name, 'thumbnail' ) ) {
			$add_extras = true;
			$extras[ $post_type_name . '_feature' ] = array(
				'control_type' => 'thewebs_switch_control',
				'sanitize'     => 'thewebs_sanitize_toggle',
				'section'      => $post_type_name . '_layout',
				'priority'     => 20,
				'default'      => thewebs()->default( $post_type_name . '_feature' ),
				'label'        => esc_html__( 'Show Featured Image?', 'thewebs' ),
				'transport'    => 'refresh',
			);
			$extras[ $post_type_name . '_feature_position' ] = array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Featured Image Position', 'thewebs' ),
				'priority'     => 20,
				'transport'    => 'refresh',
				'default'      => thewebs()->default( $post_type_name . '_feature_position', 'above' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_feature',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'above' => array(
							'name' => __( 'Above', 'thewebs' ),
						),
						'behind' => array(
							'name' => __( 'Behind', 'thewebs' ),
						),
						'below' => array(
							'name' => __( 'Below', 'thewebs' ),
						),
					),
					'responsive' => false,
				),
			);
			$extras[ $post_type_name . '_feature_ratio'] = array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_layout',
				'label'        => esc_html__( 'Featured Image Ratio', 'thewebs' ),
				'priority'     => 20,
				'default'      => thewebs()->default( $post_type_name . '_feature_ratio', '2-3' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_feature',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => 'body.' . str_replace( '_', '-', $post_type_name ) . ' .article-post-thumbnail',
						'pattern'  => 'thewebs-thumbnail-ratio-$',
						'key'      => '',
					),
					array(
						'type'     => 'class',
						'selector' => 'body.single-' . str_replace( '_', '-', $post_type_name ) . ' .article-post-thumbnail',
						'pattern'  => 'thewebs-thumbnail-ratio-$',
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'inherit' => array(
							'name' => __( 'Inherit', 'thewebs' ),
						),
						'1-1' => array(
							'name' => __( '1:1', 'thewebs' ),
						),
						'3-4' => array(
							'name' => __( '4:3', 'thewebs' ),
						),
						'2-3' => array(
							'name' => __( '3:2', 'thewebs' ),
						),
						'9-16' => array(
							'name' => __( '16:9', 'thewebs' ),
						),
						'1-2' => array(
							'name' => __( '1:2', 'thewebs' ),
						),
					),
					'responsive' => false,
					'class' => 'thewebs-three-col-short',
				),
			);
		}
		if ( post_type_supports( $post_type_name, 'comments' ) ) {
			$add_extras = true;
			$extras[ $post_type_name . '_comments' ] = array(
				'control_type' => 'thewebs_switch_control',
				'sanitize'     => 'thewebs_sanitize_toggle',
				'section'      => $post_type_name . '_layout',
				'priority'     => 20,
				'default'      => thewebs()->default( $post_type_name . '_comments' ),
				'label'        => esc_html__( 'Show Comments?', 'thewebs' ),
				'transport'    => 'refresh',
			);
		}
		if ( $add_extras ) {
			$settings = array_merge(
				$settings,
				$extras
			);
		}
		// Archives
		$thewebs_custom_post_type_archive_settings = array(
			$post_type_name . '_archive_tabs' => array(
				'control_type' => 'thewebs_tab_control',
				'section'      => $post_type_name . '_archive',
				'settings'     => false,
				'priority'     => 1,
				'input_attrs'  => array(
					'general' => array(
						'label'  => __( 'General', 'thewebs' ),
						'target' => $post_type_name . '_archive',
					),
					'design' => array(
						'label'  => __( 'Design', 'thewebs' ),
						'target' => $post_type_name . '_archive_design',
					),
					'active' => 'general',
				),
			),
			$post_type_name . '_archive_tabs_design' => array(
				'control_type' => 'thewebs_tab_control',
				'section'      => $post_type_name . '_archive_design',
				'settings'     => false,
				'priority'     => 1,
				'input_attrs'  => array(
					'general' => array(
						'label'  => __( 'General', 'thewebs' ),
						'target' => $post_type_name . '_archive',
					),
					'design' => array(
						'label'  => __( 'Design', 'thewebs' ),
						'target' => $post_type_name . '_archive_design',
					),
					'active' => 'design',
				),
			),
			'info_' . $post_type_name . '_archive_title' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 2,
				'label'        => esc_html__( 'Archive Title', 'thewebs' ),
				'settings'     => false,
			),
			'info_' . $post_type_name . '_archive_title_design' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_archive_design',
				'priority'     => 2,
				'label'        => esc_html__( 'Archive Title', 'thewebs' ),
				'settings'     => false,
			),
			$post_type_name . '_archive_title' => array(
				'control_type' => 'thewebs_switch_control',
				'sanitize'     => 'thewebs_sanitize_toggle',
				'section'      => $post_type_name . '_archive',
				'priority'     => 3,
				'default'      => thewebs()->default( $post_type_name . '_archive_title', true ),
				'label'        => esc_html__( 'Show Archive Title?', 'thewebs' ),
				'transport'    => 'refresh',
			),
			$post_type_name . '_archive_title_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Archive Title Layout', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_archive_title_layout', 'above' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'normal' => array(
							'name' => __( 'In Content', 'thewebs' ),
							'icon'    => 'incontent',
						),
						'above' => array(
							'name' => __( 'Above Content', 'thewebs' ),
							'icon'    => 'abovecontent',
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-two-col',
				),
			),
			$post_type_name . '_archive_title_inner_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_archive_title_inner_layout', 'standard' ),
				'label'        => esc_html__( 'Container Width', 'thewebs' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_archive_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => '.' . $post_type_name . '-archive-hero-section',
						'pattern'  => 'entry-hero-layout-$',
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
					'responsive' => false,
				),
			),
			$post_type_name . '_archive_title_align' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Archive Title Align', 'thewebs' ),
				'priority'     => 4,
				'default'      => thewebs()->default( $post_type_name . '_archive_title_align', array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => '',
				) ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => '.' . $post_type_name . '-archive-title',
						'pattern'  => array(
							'desktop' => 'title-align-$',
							'tablet'  => 'title-tablet-align-$',
							'mobile'  => 'title-mobile-align-$',
						),
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'left' => array(
							'tooltip'  => __( 'Left Align Title', 'thewebs' ),
							'dashicon' => 'editor-alignleft',
						),
						'center' => array(
							'tooltip'  => __( 'Center Align Title', 'thewebs' ),
							'dashicon' => 'editor-aligncenter',
						),
						'right' => array(
							'tooltip'  => __( 'Right Align Title', 'thewebs' ),
							'dashicon' => 'editor-alignright',
						),
					),
					'responsive' => true,
				),
			),
			$post_type_name . '_archive_title_height' => array(
				'control_type' => 'thewebs_range_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 5,
				'label'        => esc_html__( 'Container Min Height', 'thewebs' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_archive_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '#inner-wrap .' . $post_type_name . '-archive-hero-section .entry-header',
						'property' => 'min-height',
						'pattern'  => '$',
						'key'      => 'size',
					),
				),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_height', array(
					'size' => array(
						'mobile'  => '',
						'tablet'  => '',
						'desktop' => '',
					),
					'unit' => array(
						'mobile'  => 'px',
						'tablet'  => 'px',
						'desktop' => 'px',
					),
				) ),
				'input_attrs'  => array(
					'min'     => array(
						'px'  => 10,
						'em'  => 1,
						'rem' => 1,
						'vh'  => 2,
					),
					'max'     => array(
						'px'  => 800,
						'em'  => 12,
						'rem' => 12,
						'vh'  => 100,
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
			$post_type_name . '_archive_title_elements' => array(
				'control_type' => 'thewebs_sorter_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 6,
				'default'      => thewebs()->default( $post_type_name . '_archive_title_elements', array( 'breadcrumb', 'title', 'description' ) ),
				'label'        => esc_html__( 'Title Elements', 'thewebs' ),
				'transport'    => 'refresh',
				'settings'     => array(
					'elements'    => $post_type_name . '_archive_title_elements',
					'title'       => $post_type_name . '_archive_title_element_title',
					'breadcrumb'  => $post_type_name . '_archive_title_element_breadcrumb',
					'description' => $post_type_name . '_archive_title_element_description',
				),
				'input_attrs'  => array(
					'groupe'   => $post_type_name . '_archive_title_elements',
					'defaults' => array(
						'title'      => thewebs()->default( $post_type_name . '_archive_element_title', array(
							'enabled' => true,
						) ),
						'description'      => thewebs()->default( $post_type_name . '_archive_title_element_description', array(
							'enabled' => true,
						) ),
						'breadcrumb'       => thewebs()->default( $post_type_name . '_archive_title_element_breadcrumb', array(
							'enabled' => false,
							'show_title' => true,
						) ),
					),
				),
			),
			$post_type_name . '_archive_title_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Title Color', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_color', array(
					'color' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-title h1',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_archive_title_description_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Description Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_description_color', array(
					'color' => '',
					'hover' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-title .archive-description',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-title .archive-description a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_archive_title_breadcrumb_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Breadcrumb Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_breadcrumb_color', array(
					'color' => '',
					'hover' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-title .thewebs-breadcrumbs',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-title .thewebs-breadcrumbs a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_archive_title_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Archive Title Background', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_background', array(
					'desktop' => array(
						'color' => '',
					),
				) ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_archive_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'css_background',
						'selector' => '#inner-wrap .' . $post_type_name . '-archive-hero-section .entry-hero-container-inner',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip'  => __( 'Title Background', 'thewebs' ),
				),
			),
			$post_type_name . '_archive_title_overlay_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Background Overlay Color', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_overlay_color', array(
					'color' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.' . $post_type_name . '-archive-hero-section .hero-section-overlay',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'color',
					),
				),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_archive_title_layout',
						'operator'   => '=',
						'value'      => 'above',
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
			$post_type_name . '_archive_title_border' => array(
				'control_type' => 'thewebs_borders_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Border', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_title_border' ),
				'context'      => array(
					array(
						'setting'    => $post_type_name . '_archive_title',
						'operator'   => '=',
						'value'      => true,
					),
					array(
						'setting'    => $post_type_name . '_archive_title_layout',
						'operator'   => '=',
						'value'      => 'above',
					),
				),
				'settings'     => array(
					'border_top'    => $post_type_name . '_archive_title_top_border',
					'border_bottom' => $post_type_name . '_archive_title_bottom_border',
				),
				'live_method'     => array(
					$post_type_name . '_archive_title_top_border' => array(
						array(
							'type'     => 'css_border',
							'selector' => '.' . $post_type_name . '-archive-hero-section .entry-hero-container-inner',
							'pattern'  => '$',
							'property' => 'border-top',
							'key'      => 'border',
						),
					),
					$post_type_name . '_archive_title_bottom_border' => array( 
						array(
							'type'     => 'css_border',
							'selector' => '.' . $post_type_name . '-archive-hero-section .entry-hero-container-inner',
							'property' => 'border-bottom',
							'pattern'  => '$',
							'key'      => 'border',
						),
					),
				),
			),
			'info_' . $post_type_name . '_archive_layout' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 10,
				'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
				'settings'     => false,
			),
			// 'info_' . $post_type_name . '_archive_layout_design' => array(
			// 	'control_type' => 'thewebs_title_control',
			// 	'section'      => $post_type_name . '_archive_design',
			// 	'priority'     => 10,
			// 	'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
			// 	'settings'     => false,
			// ),
			$post_type_name . '_archive_layout' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Archive Layout', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_archive_layout' ),
				'input_attrs'  => array(
					'layout' => array(
						'normal' => array(
							'name' => __( 'Normal', 'thewebs' ),
							'icon' => 'normal',
						),
						'narrow' => array(
							'name' => __( 'Narrow', 'thewebs' ),
							'icon' => 'narrow',
						),
						'fullwidth' => array(
							'name' => __( 'Fullwidth', 'thewebs' ),
							'icon' => 'fullwidth',
						),
						'left' => array(
							'name' => __( 'Left Sidebar', 'thewebs' ),
							'icon' => 'leftsidebar',
						),
						'right' => array(
							'name' => __( 'Right Sidebar', 'thewebs' ),
							'icon' => 'rightsidebar',
						),
					),
					'class'      => 'thewebs-three-col',
					'responsive' => false,
				),
			),
			$post_type_name . '_archive_sidebar_id' => array(
				'control_type' => 'thewebs_select_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Archive Default Sidebar', 'thewebs' ),
				'transport'    => 'refresh',
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_archive_sidebar_id', 'sidebar-primary' ),
				'input_attrs'  => array(
					'options' => thewebs()->sidebar_options(),
				),
			),
			$post_type_name . '_archive_content_style' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Content Style', 'thewebs' ),
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_archive_content_style', 'boxed' ),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => 'body.post-type-archive-' . $post_type_name,
						'pattern'  => 'content-style-$',
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'boxed' => array(
							'tooltip' => __( 'Boxed', 'thewebs' ),
							'icon' => 'gridBoxed',
							'name' => __( 'Boxed', 'thewebs' ),
						),
						'unboxed' => array(
							'tooltip' => __( 'Unboxed', 'thewebs' ),
							'icon' => 'gridUnboxed',
							'name' => __( 'Unboxed', 'thewebs' ),
						),
					),
					'responsive' => false,
					'class'      => 'thewebs-two-col',
				),
			),
			$post_type_name . '_archive_columns' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 10,
				'label'        => esc_html__( 'Archive Columns', 'thewebs' ),
				'transport'    => 'refresh',
				'default'      => thewebs()->default( $post_type_name . '_archive_columns', 3 ),
				'input_attrs'  => array(
					'layout' => array(
						'1' => array(
							'name' => __( '1', 'thewebs' ),
						),
						'2' => array(
							'name' => __( '2', 'thewebs' ),
						),
						'3' => array(
							'name' => __( '3', 'thewebs' ),
						),
						'4' => array(
							'name' => __( '4', 'thewebs' ),
						),
					),
					'responsive' => false,
				),
			),
			'info_' . $post_type_name . '_archive_item_layout' => array(
				'control_type' => 'thewebs_title_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 12,
				'label'        => esc_html__( 'Post Item Layout', 'thewebs' ),
				'settings'     => false,
			),
			$post_type_name . '_archive_elements' => array(
				'control_type' => 'thewebs_sorter_control',
				'section'      => $post_type_name . '_archive',
				'priority'     => 12,
				'default'      => thewebs()->default( $post_type_name . '_archive_elements', array( 'feature', 'title', 'meta', 'excerpt', 'readmore' ) ),
				'label'        => esc_html__( 'Item Elements', 'thewebs' ),
				'transport'    => 'refresh',
				'settings'     => array(
					'elements'   => $post_type_name . '_archive_elements',
					'feature'    => $post_type_name . '_archive_element_feature',
					'categories' => $post_type_name . '_archive_element_categories',
					'title'      => $post_type_name . '_archive_element_title',
					'meta'       => $post_type_name . '_archive_element_meta',
					'excerpt'    => $post_type_name . '_archive_element_excerpt',
					'readmore'   => $post_type_name . '_archive_element_readmore',
				),
				'input_attrs'  => array(
					'groupe'   => $post_type_name . '_archive_elements',
					'sortable' => false,
					'defaults' => array(
						'feature'    => thewebs()->default( $post_type_name . '_archive_element_feature', array(
							'enabled' => true,
							'ratio'   => '2-3',
							'size'    => 'medium_large',
						) ),
						'title'      => thewebs()->default( $post_type_name . '_archive_element_title', array(
							'enabled' => true,
						) ),
						'categories'      => thewebs()->default( $post_type_name . '_archive_element_categories', array(
							'enabled' => false,
							'style'   => 'normal',
							'divider' => 'vline',
							'taxonomy' => '',
						) ),
						'meta'       => thewebs()->default( $post_type_name . '_archive_element_meta', array(
							'id'                     => 'meta',
							'enabled'                => false,
							'divider'                => 'dot',
							'author'                 => true,
							'authorLink'             => true,
							'authorImage'            => true,
							'authorImageSize'        => 25,
							'authorEnableLabel'      => true,
							'authorLabel'            => '',
							'date'                   => true,
							'dateTime'               => false,
							'dateEnableLabel'        => false,
							'dateLabel'              => '',
							'dateUpdated'            => false,
							'dateUpdatedTime'        => false,
							'dateUpdatedDifferent'   => false,
							'dateUpdatedEnableLabel' => false,
							'dateUpdatedLabel'       => '',
							'categories'             => false,
							'categoriesEnableLabel'  => false,
							'categoriesLabel'        => '',
							'comments'               => false,
							'commentsCondition'      => false,
						) ),
						'excerpt'    => thewebs()->default( $post_type_name . '_archive_element_excerpt', array(
							'enabled'     => true,
							'words'       => 55,
							'fullContent' => false,
						) ),
						'readmore'   => thewebs()->default( $post_type_name . '_archive_element_readmore', array(
							'enabled' => true,
						) ),
					),
					'dividers' => array(
						'dot' => array(
							'icon' => 'dot',
						),
						'slash' => array(
							'icon' => 'slash',
						),
						'dash' => array(
							'icon' => 'dash',
						),
						'vline' => array(
							'icon' => 'vline',
						),
						'customicon' => array(
							'icon' => 'hours',
						),
					),
					'taxonomies' => $taxs,
				),
			),
			$post_type_name . '_archive_item_image_placement' => array(
				'control_type' => 'thewebs_radio_icon_control',
				'section'      => $post_type_name . '_archive',
				'label'        => esc_html__( 'Item Image Placement', 'thewebs' ),
				'priority'     => 10,
				'default'      => thewebs()->default( $post_type_name . '_archive_item_image_placement' ),
				'context'      => array(
					array(
						'setting' => $post_type_name . '_archive_columns',
						'operator'   => '=',
						'value'   => '1',
					),
				),
				'live_method'     => array(
					array(
						'type'     => 'class',
						'selector' => '.' . $post_type_name . '-archive.grid-cols',
						'pattern'  => 'item-image-style-$',
						'key'      => '',
					),
				),
				'input_attrs'  => array(
					'layout' => array(
						'beside' => array(
							'name' => __( 'Beside', 'thewebs' ),
						),
						'above' => array(
							'name' => __( 'Above', 'thewebs' ),
						),
					),
					'responsive' => false,
				),
			),
			$post_type_name . '_archive_item_title_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Post Item Title Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_item_title_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => '',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.loop-entry.type-' . $post_type_name . ' h2.entry-title',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'             => $post_type_name . '_archive_item_title_font',
					'headingInherit' => true,
				),
			),
			$post_type_name . '_archive_item_meta_color' => array(
				'control_type' => 'thewebs_color_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Item Meta Colors', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_item_meta_color', array(
					'color' => '',
					'hover' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css',
						'selector' => '.loop-entry.type-' . $post_type_name . ' .entry-meta',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'color',
					),
					array(
						'type'     => 'css',
						'selector' => '.loop-entry.type-' . $post_type_name . ' .entry-meta a:hover',
						'property' => 'color',
						'pattern'  => '$',
						'key'      => 'hover',
					),
				),
				'input_attrs'  => array(
					'colors' => array(
						'color' => array(
							'tooltip' => __( 'Initial Color', 'thewebs' ),
							'palette' => true,
						),
						'hover' => array(
							'tooltip' => __( 'Link Hover Color', 'thewebs' ),
							'palette' => true,
						),
					),
				),
			),
			$post_type_name . '_archive_item_meta_font' => array(
				'control_type' => 'thewebs_typography_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Item Meta Font', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_item_meta_font', array(
					'size' => array(
						'desktop' => '',
					),
					'lineHeight' => array(
						'desktop' => '',
					),
					'family'  => 'inherit',
					'google'  => false,
					'weight'  => '',
					'variant' => '',
				) ),
				'live_method'     => array(
					array(
						'type'     => 'css_typography',
						'selector' => '.loop-entry.type-' . $post_type_name . ' .entry-meta',
						'property' => 'font',
						'key'      => 'typography',
					),
				),
				'input_attrs'  => array(
					'id'      => $post_type_name . '_archive_item_meta_font',
					'options' => 'no-color',
				),
			),
			$post_type_name . '_archive_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Site Background', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_background' ),
				'live_method'     => array(
					array(
						'type'     => 'css_background',
						'selector' => 'body.post-type-archive-' . $post_type_name,
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip' => __( 'Archive Background', 'thewebs' ),
				),
			),
			$post_type_name . '_archive_content_background' => array(
				'control_type' => 'thewebs_background_control',
				'section'      => $post_type_name . '_archive_design',
				'label'        => esc_html__( 'Content Background', 'thewebs' ),
				'default'      => thewebs()->default( $post_type_name . '_archive_content_background' ),
				'live_method'  => array(
					array(
						'type'     => 'css_background',
						'selector' => 'body.post-type-archive-' . $post_type_name . ' .content-bg, body.post-type-archive-' . $post_type_name . '.content-style-unboxed .site',
						'property' => 'background',
						'pattern'  => '$',
						'key'      => 'base',
					),
				),
				'input_attrs'  => array(
					'tooltip' => __( 'Archive Content Background', 'thewebs' ),
				),
			),
		);
		Theme_Customizer::add_settings( $thewebs_custom_post_type_archive_settings );
		Theme_Customizer::add_settings( $settings );
	}
}
Theme_Customizer::add_settings(
	array( 
		'info_custom_post_types_placehoder' => array(
			'control_type' => 'thewebs_title_control',
			'section'      => 'custom_posts_placeholder',
			'priority'     => 10,
			'label'        => esc_html__( 'Custom Post Types', 'thewebs' ),
			'settings'     => false,
		),
	)
);
