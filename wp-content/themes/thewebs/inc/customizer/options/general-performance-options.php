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
<div class="thewebs-compontent-custom fonts-flush-button wp-clearfix">
	<span class="customize-control-title">
		<?php esc_html_e( 'Flush Local Fonts Cache', 'thewebs' ); ?>
	</span>
	<span class="description customize-control-description">
		<?php esc_html_e( 'Click the button to reset the local fonts cache', 'thewebs' ); ?>
	</span>
	<input type="button" class="button thewebs-flush-local-fonts-button" name="thewebs-flush-local-fonts-button" value="<?php esc_attr_e( 'Flush Local Font Files', 'thewebs' ); ?>" />
</div>
<?php
$thewebs_flush_button = ob_get_clean();

Theme_Customizer::add_settings(
	array(
		'enable_scroll_to_id' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_performance',
			'default'      => thewebs()->default( 'enable_scroll_to_id' ),
			'label'        => esc_html__( 'Enable Scroll To ID', 'thewebs' ),
		),
		'lightbox' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_performance',
			'default'      => thewebs()->default( 'lightbox' ),
			'label'        => esc_html__( 'Enable Lightbox', 'thewebs' ),
		),
		'load_fonts_local' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_performance',
			'default'      => thewebs()->default( 'load_fonts_local' ),
			'label'        => esc_html__( 'Load Google Fonts Locally', 'thewebs' ),
		),
		'preload_fonts_local' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_performance',
			'default'      => thewebs()->default( 'preload_fonts_local' ),
			'label'        => esc_html__( 'Preload Local Fonts', 'thewebs' ),
			'context'      => array(
				array(
					'setting'    => 'load_fonts_local',
					'operator'   => '==',
					'value'      => true,
				),
			),
		),
		'load_fonts_local_flush' => array(
			'control_type' => 'thewebs_blank_control',
			'section'      => 'general_performance',
			'settings'     => false,
			'description'  => $thewebs_flush_button,
			'context'      => array(
				array(
					'setting'    => 'load_fonts_local',
					'operator'   => '==',
					'value'      => true,
				),
			),
		),
		'enable_preload' => array(
			'control_type' => 'thewebs_switch_control',
			'sanitize'     => 'thewebs_sanitize_toggle',
			'section'      => 'general_performance',
			'default'      => thewebs()->default( 'enable_preload' ),
			'label'        => esc_html__( 'Enable CSS Preload', 'thewebs' ),
		),
	)
);
