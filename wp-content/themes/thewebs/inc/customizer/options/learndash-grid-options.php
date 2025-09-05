<?php
/**
 * Grid Layout Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;

$settings = array(
	'sfwd-grid_layout_tabs' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_grid_layout',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_grid_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_grid_layout_design',
			),
			'active' => 'general',
		),
	),
	'sfwd-grid_layout_tabs_design' => array(
		'control_type' => 'thewebs_tab_control',
		'section'      => 'sfwd_grid_layout_design',
		'settings'     => false,
		'priority'     => 1,
		'input_attrs'  => array(
			'general' => array(
				'label'  => __( 'General', 'thewebs' ),
				'target' => 'sfwd_grid_layout',
			),
			'design' => array(
				'label'  => __( 'Design', 'thewebs' ),
				'target' => 'sfwd_grid_layout_design',
			),
			'active' => 'design',
		),
	),
	'learndash_course_grid' => array(
		'control_type' => 'thewebs_switch_control',
		'sanitize'     => 'thewebs_sanitize_toggle',
		'section'      => 'sfwd_grid_layout',
		'priority'     => 3,
		'default'      => thewebs()->default( 'learndash_course_grid' ),
		'label'        => esc_html__( 'Override Course Grid Styles', 'thewebs' ),
		'transport'    => 'refresh',
	),
	'learndash_course_grid_style' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sfwd_grid_layout',
		'priority'     => 7,
		'label'        => esc_html__( 'Content Style', 'thewebs' ),
		'default'      => thewebs()->default( 'learndash_course_grid_style' ),
		'transport'    => 'refresh',
		'context'      => array(
			array(
				'setting'    => 'learndash_course_grid',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'boxed' => array(
					'tooltip' => __( 'Boxed', 'thewebs' ),
					'icon'    => 'gridBoxed',
				),
				'unboxed' => array(
					'tooltip' => __( 'Unboxed', 'thewebs' ),
					'icon'    => 'gridUnboxed',
				),
			),
			'responsive' => false,
			'class'      => 'thewebs-two-col',
		),
	),
	'sfwd-grid_title_font' => array(
		'control_type' => 'thewebs_typography_control',
		'section'      => 'sfwd_grid_layout_design',
		'label'        => esc_html__( 'Course Grid Entry Title Font', 'thewebs' ),
		'default'      => thewebs()->default( 'sfwd-grid_title_font' ),
		'live_method'     => array(
			array(
				'type'     => 'css_typography',
				'selector' => '.ld-course-list-items .ld_course_grid.entry .entry-title',
				'property' => 'font',
				'key'      => 'typography',
			),
		),
		'context'      => array(
			array(
				'setting'    => 'learndash_course_grid',
				'operator'   => '=',
				'value'      => true,
			),
		),
		'input_attrs'  => array(
			'id'             => 'sfwd-grid_title_font',
			'headingInherit' => true,
		),
	),
);

Theme_Customizer::add_settings( $settings );

