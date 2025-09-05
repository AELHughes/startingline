<?php
/**
 * Focus Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'sfwd-focus_layout_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_topic_layout',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_topic_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_topic_layout_design',
			),
			'active' => 'general',
		),
	),
	'sfwd-focus_layout_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_topic_layout_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_topic_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_topic_layout_design',
			),
			'active' => 'design',
		),
	),
	'info_sfwd-focus_title' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_topic_layout',
		'priority'     => 2,
		'label'        => esc_html__( 'Focus Title', 'thewebs' ),
		'settings'     => false,
	),
	'info_sfwd-focus_title_design' => array(
		'control_type' => 'thewebs_title_control',
		'section'      => 'sfwd_topic_layout_design',
		'priority'     => 2,
		'label'        => esc_html__( 'Focus Title', 'thewebs' ),
		'settings'     => false,
	),
	'sfwd-focus_title' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'sfwd_topic_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'sfwd-focus_title' ),
		'label'        => esc_html__( 'Show Title in Focus Mode?', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'sfwd-focus_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sfwd_topic_layout_design',
		'label'        => esc_html__( 'Topic Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-focus_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.sfwd-focus-title h1',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'sfwd-focus_title',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'id'             => 'sfwd-focus_title_font',
			'headingInherit' => true,
		),
	),
);

Theme_Customizer::add_settings( $settings );

