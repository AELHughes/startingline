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
</div>
<?php
$compontent_tabs = ob_get_clean();
$settings        = array(
	'footer_widget3_breaker' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'sidebar-widgets-footer3',
		'settings'     => false,
		'priority'     => 5,
		'description'  => $compontent_tabs,
	),
	'footer_widget3_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sidebar-widgets-footer3',
		'label'        => esc_html__( 'Content Align', 'thewebs' ),
		'priority'     => 5,
		'default'      => thewebs()->default( 'footer_widget3_align' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'     => array(
			array(
				'type'     => 'class',
				'selector' => '.footer-widget3',
				'pattern'  => array(
					'desktop' => 'content-align-$',
					'tablet'  => 'content-tablet-align-$',
					'mobile'  => 'content-mobile-align-$',
				),
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'left'   => array(
					'tooltip'  => __( 'Left Align', 'thewebs' ),
					'dashicon' => 'editor-alignleft',
				),
				'center' => array(
					'tooltip'  => __( 'Center Align', 'thewebs' ),
					'dashicon' => 'editor-aligncenter',
				),
				'right'  => array(
					'tooltip'  => __( 'Right Align', 'thewebs' ),
					'dashicon' => 'editor-alignright',
				),
			),
			'responsive' => true,
		),
	),
	'footer_widget3_vertical_align' => array(
		'control_type' => 'thewebs_radio_icon_control',
		'section'      => 'sidebar-widgets-footer3',
		'label'        => esc_html__( 'Content Vertical Align', 'thewebs' ),
		'priority'     => 5,
		'default'      => thewebs()->default( 'footer_widget3_vertical_align' ),
		'context'      => array(
			array(
				'setting' => '__current_tab',
				'value'   => 'general',
			),
		),
		'live_method'  => array(
			array(
				'type'     => 'class',
				'selector' => '.footer-widget3',
				'pattern'  => array(
					'desktop' => 'content-valign-$',
					'tablet'  => 'content-tablet-valign-$',
					'mobile'  => 'content-mobile-valign-$',
				),
				'key'      => '',
			),
		),
		'input_attrs'  => array(
			'layout' => array(
				'top' => array(
					'tooltip' => __( 'Top Align', 'thewebs' ),
					'icon'    => 'aligntop',
				),
				'middle' => array(
					'tooltip' => __( 'Middle Align', 'thewebs' ),
					'icon'    => 'alignmiddle',
				),
				'bottom' => array(
					'tooltip' => __( 'Bottom Align', 'thewebs' ),
					'icon'    => 'alignbottom',
				),
			),
			'responsive' => true,
		),
	),
);

Theme_Customizer::add_settings( $settings );

