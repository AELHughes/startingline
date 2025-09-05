<?php
/**
 * The Radio Icon customize control extends the WP_Customize_Control class.
 *
 * @package customizer-controls
 */

if ( ! class_exists( 'WP_Customize_Control' ) ) {
	return;
}


/**
 * Class Thewebs_Control_Import_Export
 *
 * @access public
 */
class Thewebs_Control_Import_Export extends WP_Customize_Control {
	/**
	 * Control type
	 *
	 * @var string
	 */
	public $type = 'thewebs_import_export_control';
	/**
	 * Empty Render Function to prevent errors.
	 */
	public function render_content() {
		?>
			<span class="customize-control-title">
				<?php esc_html_e( 'Export', 'thewebs' ); ?>
			</span>
			<span class="description customize-control-description">
				<?php esc_html_e( 'Click the button below to export the customization settings for this theme.', 'thewebs' ); ?>
			</span>
			<input type="button" class="button thewebs-theme-export thewebs-theme-button" name="thewebs-theme-export-button" value="<?php esc_attr_e( 'Export', 'thewebs' ); ?>" />

			<hr class="kt-theme-hr" />

			<span class="customize-control-title">
				<?php esc_html_e( 'Import', 'thewebs' ); ?>
			</span>
			<span class="description customize-control-description">
				<?php esc_html_e( 'Upload a file to import customization settings for this theme.', 'thewebs' ); ?>
			</span>
			<div class="thewebs-theme-import-controls">
				<input type="file" name="thewebs-theme-import-file" class="thewebs-theme-import-file" />
				<?php wp_nonce_field( 'thewebs-theme-importing', 'thewebs-theme-import' ); ?>
			</div>
			<div class="thewebs-theme-uploading"><?php esc_html_e( 'Uploading...', 'thewebs' ); ?></div>
			<input type="button" class="button thewebs-theme-import thewebs-theme-button" name="thewebs-theme-import-button" value="<?php esc_attr_e( 'Import', 'thewebs' ); ?>" />

			<hr class="kt-theme-hr" />
			<span class="customize-control-title">
				<?php esc_html_e( 'Reset', 'thewebs' ); ?>
			</span>
			<span class="description customize-control-description">
				<?php esc_html_e( 'Click the button to reset all theme settings.', 'thewebs' ); ?>
			</span>
			<input type="button" class="components-button is-destructive thewebs-theme-reset thewebs-theme-button" name="thewebs-theme-reset-button" value="<?php esc_attr_e( 'Reset', 'thewebs' ); ?>" />
			<?php
	}
}