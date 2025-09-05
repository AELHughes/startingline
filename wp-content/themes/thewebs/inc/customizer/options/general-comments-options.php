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
		'comment_form_before_list' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_comments',
			'default'      => thewebs()->default( 'comment_form_before_list' ),
			'label'        => esc_html__( 'Move Comments input above comment list.', 'thewebs' ),
			'transport'    => 'refresh',
		),
		'comment_form_remove_web' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_comments',
			'default'      => thewebs()->default( 'comment_form_remove_web' ),
			'label'        => esc_html__( 'Remove Comments Website field.', 'thewebs' ),
			'transport'    => 'refresh',
		),
	)
);
