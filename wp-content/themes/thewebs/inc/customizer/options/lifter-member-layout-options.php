<?php
/**
 * Product Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'info_llms_membership_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'llms_membership_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Membership Title', 'thewebs' ),
		'settings'     => false,
	),
	'llms_membership_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'llms_membership_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'llms_membership_title' ),
		'label'        => esc_html__( 'Show Membership Title?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'llms_membership_title_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Membership Title Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 4,
		'default'      => thewebs()->default( 'llms_membership_title_layout' ),
		'context'      => array(
			array(
				'setting'    => 'llms_membership_title',
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
	'llms_membership_title_inner_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'priority'     => 4,
		'default'      => thewebs()->default( 'llms_membership_title_inner_layout' ),
		'label'        => esc_html__( 'Title Container Width', 'thewebs' ),
		'context'      => array(
			array(
				'setting'    => 'llms_membership_title',
				'operator'   => '=',
				'value'      => true,
			),
			array(
				'setting'    => 'llms_membership_title_layout',
				'operator'   => '=',
				'value'      => 'above',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.llms_membership-hero-section',
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
	'llms_membership_title_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Membership Title Align', 'thewebs' ),
		'priority'     => 4,
		'default'      => thewebs()->default( 'llms_membership_title_align' ),
		'context'      => array(
			array(
				'setting'    => 'llms_membership_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.llms_membership-title',
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
	'info_llms_membership_layout' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'llms_membership_layout',
		'priority'     => 10,
		'label'        => esc_html__( 'Membership Layout', 'thewebs' ),
		'settings'     => false,
	),
	'llms_membership_layout' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Membership Layout', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'llms_membership_layout' ),
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
	'llms_membership_sidebar_id' => array(
		'control_type' => 'thewebs_select_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Membership Default Sidebar', 'thewebs' ),
		'transport'    => 'refresh',
		'priority'     => 10,
		'default'      => thewebs()->default( 'llms_membership_sidebar_id' ),
		'input_attrs'  => array(
			'options' => thewebs()->sidebar_options(),
		),
	),
	'llms_membership_content_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'llms_membership_content_style' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-llms_membership',
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
	'llms_membership_vertical_padding' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'llms_membership_layout',
		'label'        => esc_html__( 'Content Vertical Padding', 'thewebs' ),
		'priority'     => 10,
		'default'      => thewebs()->default( 'llms_membership_vertical_padding' ),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => 'body.single-llms_membership',
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
);

Theme_Customizer::add_settings( $settings );

