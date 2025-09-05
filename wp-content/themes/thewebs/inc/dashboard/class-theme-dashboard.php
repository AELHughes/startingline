<?php
/**
 * Build Welcome Page with settings.
 *
 * @package Thewebs
 */

if (! defined('ABSPATH')) {
    exit;
}


/**
 * Build Welcome Page class
 *
 * @category class
 */
class Thewebs_Dashboard_Settings
{
    /**
     * Settings of this class
     *
     * @var array
     */
    public static $settings = array();

    /**
     * Instance of this class
     *
     * @var null
     */
    private static $instance = null;
    /**
     * Static var active plugins
     *
     * @var $active_plugins
     */
    private static $active_plugins;

    /**
     * Instance Control
     */
    public static function get_instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    /**
     * Class Constructor.
     */
    public function __construct()
    {
        // only load if admin.
        if (is_admin()) {
            add_action('admin_menu', array( $this, 'add_menu' ));
        }
        add_action('init', array( $this, 'load_api_settings' ));
    }
    /**
     * Redirect to the settings page on activation.
     *
     * @param string $key setting key.
     */
    public static function get_data_options($key)
    {
        if (! isset(self::$settings[ $key ])) {
            self::$settings[ $key ] = get_option($key, array());
        }
        return self::$settings[ $key ];
    }
    /**
     * Add option page menu
     */
    public function add_menu()
    {
        $page = add_theme_page(__('Thewebs - Next Generation Theme', 'thewebs'), __('Thewebs', 'thewebs'), apply_filters('thewebs_admin_settings_capability', 'manage_options'), 'thewebs', array( $this, 'config_page' ));
        add_action('admin_print_styles-' . $page, array( $this, 'scripts' ));
        do_action('thewebs_theme_admin_menu');
    }
    /**
     * Initialize getting the active plugins list.
     */
    public static function get_active_plugins()
    {

        self::$active_plugins = (array) get_option('active_plugins', array());

        if (is_multisite()) {
            self::$active_plugins = array_merge(self::$active_plugins, get_site_option('active_sitewide_plugins', array()));
        }
    }
    /**
     * Active Plugin Check
     *
     * @param string $plugin_base_name is plugin folder/filename.php.
     */
    public static function active_plugin_check($plugin_base_name)
    {

        if (! self::$active_plugins) {
            self::get_active_plugins();
        }
        return in_array($plugin_base_name, self::$active_plugins, true) || array_key_exists($plugin_base_name, self::$active_plugins);
    }
    /**
     * Loads admin style sheets and scripts
     */
    public function scripts()
    {
        $installed_plugins = get_plugins();
        $button_label = esc_html__('Browse Thewebs Starter Templates', 'thewebs');
        $data_action  = '';
        if (! defined('THEWEBS_STARTER_TEMPLATES_VERSION')) {
            if (! isset($installed_plugins['thewebs-starter-templates/thewebs-starter-templates.php'])) {
                $button_label = esc_html__('Install Thewebs Starter Templates', 'thewebs');
                $data_action  = 'install';
            } elseif (! self::active_plugin_check('thewebs-starter-templates/thewebs-starter-templates.php')) {
                $button_label = esc_html__('Activate Thewebs Starter Templates', 'thewebs');
                $data_action  = 'activate';
            }
        }
        wp_enqueue_style('thewebs-dashboard', get_template_directory_uri() . '/inc/dashboard/react/dash-controls.min.css', array( 'wp-components' ), THEWEBS_VERSION);
        wp_enqueue_script('thewebs-dashboard', get_template_directory_uri() . '/assets/js/admin/dashboard.js', array( 'wp-i18n', 'wp-element', 'wp-plugins', 'wp-components', 'wp-api', 'wp-hooks', 'wp-edit-post', 'lodash', 'wp-block-library', 'wp-block-editor', 'wp-editor', 'jquery' ), THEWEBS_VERSION, true);
        wp_localize_script(
            'thewebs-dashboard',
            'thewebsDashboardParams',
            array(
                'adminURL' => esc_url(admin_url()),
                'settings' => esc_attr(get_option('thewebs_theme_config')),
                'changelog' => $this->get_changelog(),
                'proChangelog' => (class_exists('Thewebs_Theme_Pro') ? $this->get_pro_changelog() : ''),
                'starterTemplates' => (defined('THEWEBS_STARTER_TEMPLATES_VERSION') ? true : false),
                'ajax_url'   => admin_url('admin-ajax.php'),
                'ajax_nonce' => wp_create_nonce('thewebs-ajax-verification'),
                'status'       => $data_action,
                'starterLabel' => $button_label,
                'starterImage' => esc_attr(get_template_directory_uri() . '/assets/images/starter-templates-banner.jpeg'),
                'starterURL' => esc_url(admin_url('themes.php?page=thewebs-starter-templates')),
                'videoImage' => esc_attr(get_template_directory_uri() . '/assets/images/getting-started-video.jpg'),
            )
        );
        if (function_exists('wp_set_script_translations')) {
            wp_set_script_translations('thewebs-dashboard', 'thewebs');
        }
    }
    /**
     * Get Changelog ( Largely Borrowed From Neve Theme )
     */
    public function get_changelog()
    {
        $changelog      = array();
        $changelog_path = get_template_directory() . '/changelog.txt';
        if (! is_file($changelog_path)) {
            return $changelog;
        }
        global $wp_filesystem;
        if (! is_object($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $changelog_string = $wp_filesystem->get_contents($changelog_path);
        if (is_wp_error($changelog_string)) {
            return $changelog;
        }
        $changelog = explode(PHP_EOL, $changelog_string);
        $releases  = [];
        foreach ($changelog as $changelog_line) {
            if (empty($changelog_line)) {
                continue;
            }
            if (substr(ltrim($changelog_line), 0, 2) === '==') {
                if (isset($release)) {
                    $releases[] = $release;
                }
                $changelog_line = trim(str_replace('=', '', $changelog_line));
                $release = array(
                    'head'    => $changelog_line,
                );
            } else {
                if (preg_match('/[*|-]?\s?(\[fix]|\[Fix]|fix|Fix)[:]?\s?\b/', $changelog_line)) {
                    //$changelog_line     = preg_replace( '/[*|-]?\s?(\[fix]|\[Fix]|fix|Fix)[:]?\s?\b/', '', $changelog_line );
                    $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                    $release['fix'][] = $changelog_line;
                    continue;
                }

                if (preg_match('/[*|-]?\s?(\[add]|\[Add]|add|Add)[:]?\s?\b/', $changelog_line)) {
                    //$changelog_line        = preg_replace( '/[*|-]?\s?(\[add]|\[Add]|add|Add)[:]?\s?\b/', '', $changelog_line );
                    $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                    $release['add'][] = $changelog_line;
                    continue;
                }
                $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                $release['update'][] = $changelog_line;
            }
        }
        return $releases;
    }
    /**
     * Get Changelog ( Largely Borrowed From Neve Theme )
     */
    public function get_pro_changelog()
    {
        $changelog      = array();
        if (! defined('KTP_PATH')) {
            return $changelog;
        }
        $changelog_path = KTP_PATH . '/changelog.txt';
        if (! is_file($changelog_path)) {
            return $changelog;
        }
        global $wp_filesystem;
        if (! is_object($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $changelog_string = $wp_filesystem->get_contents($changelog_path);
        if (is_wp_error($changelog_string)) {
            return $changelog;
        }
        $changelog = explode(PHP_EOL, $changelog_string);
        $releases  = [];
        foreach ($changelog as $changelog_line) {
            if (empty($changelog_line)) {
                continue;
            }
            if (substr(ltrim($changelog_line), 0, 2) === '==') {
                if (isset($release)) {
                    $releases[] = $release;
                }
                $changelog_line = trim(str_replace('=', '', $changelog_line));
                $release = array(
                    'head'    => $changelog_line,
                );
            } else {
                if (preg_match('/[*|-]?\s?(\[fix]|\[Fix]|fix|Fix)[:]?\s?\b/', $changelog_line)) {
                    //$changelog_line     = preg_replace( '/[*|-]?\s?(\[fix]|\[Fix]|fix|Fix)[:]?\s?\b/', '', $changelog_line );
                    $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                    $release['fix'][] = $changelog_line;
                    continue;
                }

                if (preg_match('/[*|-]?\s?(\[add]|\[Add]|add|Add)[:]?\s?\b/', $changelog_line)) {
                    //$changelog_line        = preg_replace( '/[*|-]?\s?(\[add]|\[Add]|add|Add)[:]?\s?\b/', '', $changelog_line );
                    $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                    $release['add'][] = $changelog_line;
                    continue;
                }
                $changelog_line = trim(str_replace([ '*', '-' ], '', $changelog_line));
                $release['update'][] = $changelog_line;
            }
        }
        return $releases;
    }

    /**
     * Register settings
     */
    public function load_api_settings()
    {

        register_setting(
            'thewebs_theme_config',
            'thewebs_theme_config',
            array(
                'type'              => 'string',
                'description'       => __('Config Thewebs Modules', 'thewebs'),
                'sanitize_callback' => 'sanitize_text_field',
                'show_in_rest'      => true,
                'default'           => '',
            )
        );
    }

    /**
     * Loads config page
     */
    public function config_page()
    {
        ?>
		<div class="thewebs_theme_dash_head">
			<div class="thewebs_theme_dash_head_container">
				<div class="thewebs_theme_dash_logo">
					<img src="<?php echo esc_attr(get_template_directory_uri() . '/assets/images/thewebs-logo.png'); ?>">
				</div>
				<div class="thewebs_theme_dash_version">
					<span>
						<?php echo esc_html(THEWEBS_VERSION); ?>
					</span>
				</div>
			</div>
		</div>
		<div class="wrap thewebs_theme_dash">
			<div class="thewebs_theme_dashboard">
				<h2 class="notices" style="display:none;"></h2>
				<?php settings_errors(); ?>
				<div class="page-grid">
					<div class="thewebs_theme_dashboard_main">
					</div>
				</div>
			</div>
		</div>
		<?php
    }

}
Thewebs_Dashboard_Settings::get_instance();
