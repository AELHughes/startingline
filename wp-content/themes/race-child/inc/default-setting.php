<?php
/**
 * Class for the Custom Theme
 *
 * @package thewebs
 */

namespace Thewebs\Default_Setting;


use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;
use Thewebs_Blocks_Frontend;
use Thewebs\Component_Interface;
use Thewebs\Templating_Component_Interface;
use Thewebs\Thewebs_CSS;
use LearnDash_Settings_Section;
use function Thewebs\get_webfont_url;
use function Thewebs\print_webfont_preload;
use function add_action;
use function add_filter;
use function wp_enqueue_style;
use function wp_register_style;
use function wp_style_add_data;
use function get_theme_file_uri;
use function get_theme_file_path;
use function wp_styles;
use function esc_attr;
use function esc_url;
use function wp_style_is;
use function _doing_it_wrong;
use function wp_print_styles;
use function post_password_required;
use function is_singular;
use function comments_open;
use function get_comments_number;
use function apply_filters;
use function add_query_arg;
use function wp_add_inline_style;

/**
 * Main plugin class
 */
class Custom_Theme {
	/**
	 * Instance Control
	 *
	 * @var null
	 */
	private static $instance = null;

	/**
	 * Holds theme array sections.
	 *
	 * @var the theme settings sections.
	 */
	private $update_options = array();

	/**
	 * Holds default palette values
	 *
	 * @var values of the theme settings.
	 */
	protected static $default_palette = null;

	/**
	 * Instance Control.
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cloning instances of the class is Forbidden', 'thewebs' ), '1.0' );
	}

	/**
	 * Disable un-serializing of the class.
	 *
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Unserializing instances of the class is forbidden', 'thewebs' ), '1.0' );
	}
	/**
	 * Constructor function.
	 */
	public function __construct() {
		
		add_filter( 'thewebs_theme_options_defaults', array( $this, 'add_option_defaults' ), 10 );
		add_filter( 'thewebs_global_palette_defaults', array( $this, 'add_color_option_defaults' ), 50 );
		add_filter( 'thewebs_addons_theme_options_defaults', array( $this, 'add_addon_option_defaults' ), 10 );
		add_filter( 'thewebs_dynamic_css', array( $this, 'child_dynamic_css' ), 30 );
	}
	public function child_dynamic_css( $css ) {
		$generated_css = $this->generate_child_css();
		if ( ! empty( $generated_css ) ) {
		$css .= "\n/* Base Pro Header CSS */\n" . $generated_css;
		}
		return $css;
	}
	public function generate_child_css () {
		$css = new Thewebs_CSS();
		
		$css->set_selector( '.primary-sidebar.widget-area .widget-title, .widget_block h2,.widget_block .widgettitle,.widget_block .widgettitle,.primary-sidebar h2' );
		$css->render_font( thewebs()->option( 'sidebar_widget_title' ), $css );
		return $css->css_output();
	}
	/**
	 * set child theme Default color.
	 */
	public function add_color_option_defaults( $defaults ) {
		if ( is_null( self::$default_palette ) ) {
			self::$default_palette = '{"palette":[{"color":"#333333","slug":"palette1","name":"Palette Color 1"},
												  {"color":"#F26B38","slug":"palette2","name":"Palette Color 2"},
												  {"color":"#FEF1EC","slug":"palette3","name":"Palette Color 3"},
												  {"color":"#222222","slug":"palette4","name":"Palette Color 4"},
												  {"color":"#333333","slug":"palette5","name":"Palette Color 5"},
												  {"color":"#DADADA","slug":"palette6","name":"Palette Color 6"},
												  {"color":"#ffffff","slug":"palette7","name":"Palette Color 7"},
												  {"color":"#ffffff","slug":"palette8","name":"Palette Color 8"},
												  {"color":"#ffffff","slug":"palette9","name":"Palette Color 9"}],
								"second-palette":[{"color":"#ffffff","slug":"palette1","name":"Palette Color 1"},
										          {"color":"#CD3A00","slug":"palette2","name":"Palette Color 2"},
										          {"color":"#1C1C1C","slug":"palette3","name":"Palette Color 3"},
										          {"color":"#000000","slug":"palette4","name":"Palette Color 4"},
										          {"color":"#2B2B2B","slug":"palette5","name":"Palette Color 5"},
										          {"color":"#3c3c3c","slug":"palette6","name":"Palette Color 6"},
										          {"color":"#000000","slug":"palette7","name":"Palette Color 7"},
										          {"color":"#000000","slug":"palette8","name":"Palette Color 8"},
										          {"color":"#ffffff","slug":"palette9","name":"Palette Color 9"}],
										"third-palette":[{"color":"#2B6CB0","slug":"palette1","name":"Palette Color 1"},{"color":"#215387","slug":"palette2","name":"Palette Color 2"},{"color":"#1A202C","slug":"palette3","name":"Palette Color 3"},{"color":"#2D3748","slug":"palette4","name":"Palette Color 4"},{"color":"#4A5568","slug":"palette5","name":"Palette Color 5"},{"color":"#718096","slug":"palette6","name":"Palette Color 6"},{"color":"#EDF2F7","slug":"palette7","name":"Palette Color 7"},{"color":"#F7FAFC","slug":"palette8","name":"Palette Color 8"},{"color":"#ffffff","slug":"palette9","name":"Palette Color 9"}],"active":"palette"}';
		}
		return self::$default_palette;
	}

	public function add_option_defaults( $defaults ) {

		$update_options = array(
			'content_width'   => array(
				'size' => 1448,
				'unit' => 'px',
			),
			'content_narrow_width'   => array(
				'size' => 1300,
				'unit' => 'px',
			),
			'boxed_shadow' => array(
				'color'   => 'rgba(0,0,0,0.05)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'boxed_border_radius' => array(
				'size'   => array( '0', '0', '0', '0' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'boxed_grid_shadow' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'boxed_grid_border_radius' => array(
				'size'   => array( '0', '0', '0', '0' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'content_background'                => array(
				'desktop' => array(
					'color' => 'palette8',
				),
			),
			'content_spacing'   => array(
				'size' => array(
					'mobile'  => 5,
					'tablet'  => 6,
					'desktop' => 8.125,
				),
				'unit' => array(
					'mobile'  => 'em',
					'tablet'  => 'em',
					'desktop' => 'em',
				),
			),
			'content_edge_spacing'   => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 1.5,
				),
				'unit' => array(
					'mobile'  => 'rem',
					'tablet'  => 'rem',
					'desktop' => 'rem',
				),
			),
			// Sidebar.
			'sidebar_widget_title' => array(
				'size' => array(
					'desktop' => 24,
					'mobile' => '20',
				),
				'lineHeight' => array(
					'desktop' => 36,
					'mobile' => '30',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'color'   => 'palette1',
				'transform' => 'uppercase'
			),
			'sidebar_widget_content'            => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '0',
				),
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'none'
			),
			'sidebar_link_colors' => array(
				'color' => 'palette1',
				'hover' => 'palette2',
			),
			'sidebar_sticky'               => true,
			'sidebar_sticky_last_widget'   => false,
			'sidebar_link_style' => 'plain',
			'sidebar_widget_spacing'   => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 24,
				),
				'unit' => array(
					'mobile'  => 'em',
					'tablet'  => 'em',
					'desktop' => 'px',
				),
			),
			// Links.
			'link_color'                     => array(
				'highlight'      => 'palette2',
				'highlight-alt'  => 'palette2',
				'highlight-alt2' => 'palette2',
				'style'          => 'standard',
			),
			// Scroll To Top.
			'scroll_up_icon'          => 'arrow-up',
			'scroll_up_color'                     => array(
				'color'  => 'palette9',
				'hover'  => '',
			),
			'scroll_up_background'                     => array(
				'color'  => 'palette2',
				'hover'  => '',
			),
			'scroll_up_border_colors'         => array(
				'color'  => 'palette6',
				'hover'  => '',
			),
			'scroll_up_border'    => array(
				'width' => '1',
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			'scroll_up_radius' => array(
				'size'   => array( 0, 0, 0, 0 ),
				'unit'   => 'px',
				'locked' => true,
			),
			'scroll_up_icon_size'   => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 18,
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'scroll_up_bottom_offset'   => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 30,
				),
			),
			'scroll_up_visiblity' => array(
				'desktop' => true,
				'tablet'  => true,
				'mobile'  => true,
			),
			// Buttons.
			'buttons_border'        => array(
				'desktop' => array(
					'width' => '0',
					'unit'  => 'px',
					'style' => 'solid',
					'color' => 'palette6',
					),
			),
			'buttons_border_radius' => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => '0',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'buttons_typography'    => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '26',

				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'spacingType' => 'px',
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform' => 'uppercase',
				'color' => 'palette9',
			),
			'buttons_padding'        => array(
				'size'   => array( 
					'desktop' => array( '15', '50', '15', '50' ),
				),
				'unit'   => array(
					'desktop' => 'px',
				),
				'locked' => array(
					'desktop' => false,
				),
			),
			'buttons_shadow' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'buttons_shadow_hover' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'buttons_background' => array(
				'color'  => 'palette2',
				'hover'  => 'palette1',
			),
			'buttons_color' => array(
				'color'  => 'palette1',
				'hover'  => 'palette9',
			),
			'buttons_border_colors' => array(
				'color' => 'palette6',
				'hover'  => 'palette6',
			),
			// Typography.
			'font_rendering' => false,
			'base_font' => array(
				'size' => array(
					'desktop' => 16,
				),
				'lineHeight' => array(
					'desktop' => 1.6,
				),
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'none',
			),
			'load_base_italic'    => false,
			'google_subsets'      => array(),
			'load_fonts_local'    => false,
			'preload_fonts_local' => true,
			'heading_font'        => array(
				'family' => 'inherit',
			),
			'h1_font' => array(
				'size' => array(
					'desktop' => 70,
				),
				'lineHeight' => array(
					'desktop' => 1.5,
				),
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'color'   => 'palette1',
				'transform' => 'uppercase',
			),
			'h2_font' => array(
				'size' => array(
					'desktop' => 55,
				),
				'lineHeight' => array(
					'desktop' => '75',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'color'   => 'palette1',
				'transform' => 'uppercase',
			),
			'h3_font' => array(
				'size' => array(
					'desktop' => 24,
				),
				'lineHeight' => array(
					'desktop' => 36,
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'color'   => 'palette1',
				'transform' => 'uppercase',
			),
			'h4_font' => array(
				'size' => array(
					'desktop' => 16,
				),
				'lineHeight' => array(
					'desktop' => 1.5,
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'none',
			),
			'h5_font' => array(
				'size' => array(
					'desktop' => 15,
				),
				'lineHeight' => array(
					'desktop' => 1.5,
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'none',
			),
			'h6_font' => array(
				'size' => array(
					'desktop' => 14,
				),
				'lineHeight' => array(
					'desktop' => 1.5,
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'none',
			),
			'title_above_font' => array(
				'size' => array(
					'mobile' => '25',
					'tablet' => '60',
					'desktop' => '70',
				),
				'lineHeight' => array(
					'desktop' => '80',
					'tablet' => '70',
					'mobile' => '35',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'transform' => 'uppercase',
				'color'   => 'palette9',
			),
			'title_above_breadcrumb_font' => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
			),
			'google_subsets' => array(
				'latin-ext' => false,
				'cyrillic' => false,
				'cyrillic-ext' => false,
				'greek' => false,
				'greek-ext' => false,
				'vietnamese' => false,
				'arabic' => false,
				'khmer' => false,
				'chinese' => false,
				'chinese-simplified' => false,
				'tamil' => false,
				'bengali' => false,
				'devanagari' => false,
				'hebrew' => false,
				'korean' => false,
				'thai' => false,
				'telugu' => false,
			),
			'header_mobile_switch'            => array(
				'size' => '',
				'unit' => 'px',
			),
			// Header.
			'header_desktop_items'       => array(
				'top' => array(
					'top_left'         => array(),
					'top_left_center'  => array(),
					'top_center'       => array(),
					'top_right_center' => array(),
					'top_right'        => array( ),
				),
				'main' => array(
					'main_left'         => array(  'logo' ),
					'main_left_center'  => array(),
					'main_center'       => array( 'navigation' ),
					'main_right_center' => array(),
					'main_right'        => array( 'search-bar' ),
				),
				'bottom' => array(
					'bottom_left'         => array(),
					'bottom_left_center'  => array(),
					'bottom_center'       => array(),
					'bottom_right_center' => array(),
					'bottom_right'        => array(),
				),
			),
			'header_wrap_background' => array(
				'desktop' => array(
					'color' => 'palette8',
				),
			),
			// Header Main.
			'header_main_height' => array(
				'size' => array(
					'mobile'  => '60',
					'tablet'  => '60',
					'desktop' => '90',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'header_main_layout'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'fullwidth',
			),
			'header_main_background' => array(
				'desktop' => array(
					'color'   => 'palette1',
				),
				'tablet' => array(
					'color'   => 'palette1',
				),
				'mobile' => array(
					'color'   => 'palette1',
				),
			),
			'header_top_bottom_border' => array(
				'desktop' => array(
					'width' => '0',
					'unit'  => 'px',
					'style' => 'solid',
					'color' => '#2b2b2b',
					),
			),
			'header_main_bottom_border' => array(
				'desktop' => array(
					'width' => '0',
					'unit'  => 'px',
					'style' => 'solid',
					'color' => 'palette4',
					),
			),
			'header_main_padding' => array(
				'size'   => array( 
					'mobile' => array( '', '15', '', '15' ),
					'tablet' => array( '', '30', '', '30' ),
					'desktop' => array( '', '60', '', '60' ),
				),
				'unit'   => array(
					'mobile' => 'px',
					'tablet' => 'px',
					'desktop' => 'px',
				),
				'locked' => array(
					'mobile' => false,
					'tablet' => false,
					'desktop' => false,
				),
			),
			// Header Top.
			'header_top_height'       => array(
				'size' => array(
					'mobile'  => 35,
					'tablet'  => 35,
					'desktop' => 45,
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'header_top_background'    => array(
				'desktop' => array(
					'color' => 'palette2',
				),
			),
			'header_top_padding' => array(
				'size'   => array( 
					'mobile' => array( '', '', '', '' ),
					'tablet' => array( '', '30', '', '30' ),
					'desktop' => array( '', '60', '', '60' ),
				),
				'unit'   => array(
					'tablet' => 'px',
					'desktop' => 'px',

				),
				'locked' => array(
					'tablet' => false,
					'desktop' => false,
				),
			),
			'header_top_bottom_border'    => array(
				'width' => 0,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'currentColor',
			),
			'header_top_layout'        => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'fullwidth',
			),
			// Header Bottom.
			'header_bottom_background'    => array(
				'desktop' => array(
					'color' => '#fff',
				),
			),
			'header_bottom_layout'        => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'fullwidth',
			),
			'header_bottom_height'       => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 0,
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			// Mobile Header.
			'mobile_button_label'      => __( 'Get A Quote', 'thewebs' ),
			'mobile_button_style'      => 'filled',
			'mobile_button_size'       => 'medium',
			'mobile_button_visibility' => 'all',
			'mobile_button_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato, sans-serif',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
			),
			'mobile_button_color'              => array(
				'color' => '',
				'hover' => '',
			),
			'mobile_button_background'              => array(
				'color' => '',
				'hover' => '',
			),
			'mobile_button_radius' => array(
				'size'   => array( '0', '0', '0', '0' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_mobile_items' => array(
				'popup' => array(
					'popup_content' => array(  'mobile-navigation' ),
				),
				'top' => array(
					'top_left'   => array(),
					'top_center' => array(),
					'top_right'  => array(),
				),
				'main' => array(
					'main_left'   => array( 'mobile-logo' ),
					'main_center' => array(),
					'main_right'  => array( 'popup-toggle' ),
				),
				'bottom' => array(
					'bottom_left'   => array(),
					'bottom_center' => array(),
					'bottom_right'  => array(),
				),
			),
			// Logo.
			'logo_width' => array(
				'size' => array(
					'mobile'  => '85',
					'tablet'  => '90',
					'desktop' => '97',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'use_mobile_logo' => false,
			'logo_layout'     => array(
				'include' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 'logo_only',
				),
				'layout' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 'standard',
				),
			),
			'header_logo_padding' => array(
				'size'   => array( 
					'desktop' => array( '', '', '', '' ),
				),
				'unit'   => array(
					'desktop' => 'px',
				),
				'locked' => array(
					'desktop' => false,
				),
			),
			// Navigation.
			'primary_navigation_typography'            => array(
				'size' => array(
					'desktop' => '14',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform' => 'uppercase',
				'color' => 'palette9'
			),
			'primary_navigation_style'   => 'fullheight',
			'primary_navigation_color'   => array(
				'color'  => 'palette9',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'primary_navigation_spacing'            => array(
				'size' => 50,
				'unit' => 'px',
			),
			// Secondary Navigation.
			'secondary_navigation_spacing'            => array(
				'size' => 40,
				'unit' => 'px',
			),
			'secondary_navigation_color'   => array(
				'color'  => 'palette',
				'hover'  => 'palette9',
				'active' => 'palette9',
			),
			'secondary_navigation_typography'            => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato, sans-serif',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'transform' => 'uppercase',
			),
			'secondary_navigation_vertical_spacing'   => array(
				'size' => 0,
				'unit' => 'em',
			),
			// Dropdown.
             
			'dropdown_navigation_color'              => array(
				'color'  => 'palette9',
				'hover'  => 'palette9',
				'active' => 'palette9',
			),
			'dropdown_navigation_background'              => array(
				'color'  => 'palette1',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'dropdown_navigation_typography'            => array(
				'size' => array(
					'desktop' => 14,
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform' => 'uppercase',
			),
            'dropdown_navigation_divider'              => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			'dropdown_navigation_vertical_spacing'   => array(
				'size' => 17,
				'unit' => 'px',
			),
			// Mobile Trigger.
			'mobile_trigger_color'              => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'mobile_trigger_padding' => array(
				'size'   => array( '0', '0', '0', '0' ),
				'unit'   => 'em',
				'locked' => false,
			),
			// Mobile Navigation.
			'mobile_navigation_color'              => array(
				'color'  => 'palette1',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'mobile_navigation_typography'            => array(
				'size' => array(
					'desktop' => 14,
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform' => 'uppercase'
			),
			'mobile_navigation_divider'              => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			// Header Popup.
			'header_popup_layout'         => 'sidepanel',
			'header_popup_close_color'  => array(
				'color' => 'palette1',
				'hover' => 'palette2',
			),
			'header_popup_background' => array(
				'desktop' => array(
					'color' => 'palette8',
				),
				'tablet' => array(
					'color' => 'palette8',
				),
				'mobile' => array(
					'color' => 'palette8',
				),
			),
			// Header HTML.
			'header_html_content'    => __( 'Follow Us : ' , 'thewebs' ),
			'header_html_typography' => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'jost',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform'  => 'uppercase',
			),
			'header_html_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// HTML2
			'header_html2_content'    => __( '10 West 32nd Street, UK', 'thewebs-pro' ),
			'header_html2_wpautop'    => true,
			'header_html2_typography' => array(
				'size' => array(
					'desktop' => '12',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => 0.1,
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '500',
				'variant' => '500',
				'color'   => 'palette7',
				'transform'  => 'uppercase',
			),
			'header_html2_link_style' => 'normal',
			'header_html2_link_color' => array(
				'color' => '',
				'hover' => '',
			),
			'header_html2_margin' => array(
				'size'   => array( '', '', '', '30' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// Mobile HTML.
			// HTML3
			// Mobile HTML.
			'header_mobile_contact_margin' => array(
				'size'   => array( '', '25', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// Header Button.
			'header_button_label'      => __( 'find a coach' , 'thewebs' ),
			'header_button_link'      => 'contact-us',
			'header_button_style'      => 'filled',
			'header_button_size'       => 'custom',
			'header_button_visibility' => 'all',
			'header_button_padding'   => array(
				'size'   => array( '13', '24.7', '13', '24.7' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'header_button_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '24',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '500',
				'variant' => '500',
				'transform'  => 'uppercase',
				'color' => 'palette9',
			),
			'header_button_radius' => array(
				'size'   => array( '0', '0', '0', '0' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_button_shadow' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'header_button_shadow_hover' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'header_button_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'header_button_color'              => array(
				'color' => 'palette2',
				'hover' => 'palette9',
			),
			'header_button_background'              => array(
				'color' => 'palette9',
				'hover' => 'palette1',
			),
			'header_button_border_colors'              => array(
				'color' => 'palette1',
				'hover' => 'palette1',
			),
			'header_button_border'              => array(
					'width' => '0',
					'unit'  => 'px',
					'style' => 'solid',
					'color' => 'palette1'
			),
			// Header Social.
			'header_social_items' => array(
				'items' => array(
					array(
						'id'      => 'facebook',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'facebookAlt2',
						'label'   => 'facebook',
					),
					array(
						'id'      => 'instagram',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '#',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'instagramAlt',
						'label'   => 'instagram',
					),
					array(
						'id'      => 'twitter',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'twitter',
						'label'   => 'twitter',
					)
				),
			),
			'header_social_style'        => 'outline',
			'header_social_show_label'   => false,
			'header_social_item_spacing' => array(
				'size' => 10,
				'unit' => 'px',
			),
			'header_social_icon_size' => array(
				'size' => 15,
				'unit' => 'px',
			),
			'header_social_brand' => '',
			'header_social_color' => array(
				'color' => 'palette2',
				'hover' => 'palette1',
			),
			'header_social_background' => array(
				'color' => 'palette9',
				'hover' => 'palette3',
			),
			'header_social_border_colors' => array(
				'color' => '',
				'hover' => '',
			),
			'header_social_border' => array(
				'width' => 0,
				'unit'  => 'px',
				'style' => 'solid',
			),
			'header_social_border_radius' => array(
				'size' => 50,
				'unit' => 'px',
			),
			'header_social_typography' => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Jost',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'transform' => 'uppercase',
			),
			'header_social_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// Mobile Header Social.
			'header_mobile_social_items' => array(
				'items' => array(
					array(
						'id'      => 'facebook',
						'enabled' => true,
						'source'  => '',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => '',
						'label'   => 'Facebook',
					),
					array(
						'id'      => 'twitter',
						'enabled' => true,
						'source'  => '',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => '',
						'label'   => 'Twitter',
					),
					array(
						'id'      => 'instagram',
						'enabled' => true,
						'source'  => '',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => '',
						'label'   => 'Instagram',
					),
				),
			),
			'header_mobile_social_style'        => 'filled',
			'header_mobile_social_show_label'   => true,
			'header_mobile_social_item_spacing' => array(
				'size' => 0.3,
				'unit' => 'em',
			),
			'header_mobile_social_icon_size' => array(
				'size' => 1,
				'unit' => 'em',
			),
			'header_mobile_social_brand' => '',
			'header_mobile_social_color' => array(
				'color' => '',
				'hover' => 'palette1',
			),
			'header_mobile_social_background' => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'header_mobile_social_border_colors' => array(
				'color' => '',
				'hover' => '',
			),
			'header_mobile_social_border' => array(
				'width' => 2,
				'unit'  => 'px',
				'style' => 'solid',
			),
			'header_mobile_social_border_radius' => array(
				'size' => 3,
				'unit' => 'px',
			),
			'header_mobile_social_typography' => array(
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
			),
			'header_mobile_social_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// Header Search.
			'header_search_icon_size' => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => 15,
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'header_search_color'              => array(
				'color' => 'palette3',
				'hover' => 'palette9',
			),
			'header_search_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'em',
				'locked' => false,
			),
			'header_search_padding' => array(
				'size'   => array( '0', '11', '0', '0' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'header_search_background'              => array(
				'color' => '',
				'hover' => '',
			),
			// Mobile Header Button.
			'mobile_button_shadow' => array(
				'color'   => 'rgba(0,0,0,0)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			'mobile_button_shadow_hover' => array(
				'color'   => 'rgba(0,0,0,0.1)',
				'hOffset' => 0,
				'vOffset' => 0,
				'blur'    => 0,
				'spread'  => 0,
				'inset'   => false,
			),
			// Mobile Header HTML.
			'mobile_html_content'    => __( 'Mon - Sat 8:00 17:30, Sunday - CLOSED', 'thewebs' ),
			'mobile_html_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
				'transform'  => 'uppercase',
			),
			'mobile_html_link_color'              => array(
				'color' => '',
				'hover' => '',
			),
			'mobile_html_margin' => array(
				'size'   => array( '', '', '', '25' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'mobile_html_link_style' => 'normal',
			'mobile_html_wpautop' => true,
			// Transparent Header.
			'transparent_header_enable' => false,
			'transparent_header_post'       => true,
			'transparent_header_device' => array(
				'desktop' => true,
				'mobile'  => false,
			),
			'transparent_header_background'                => array(
				'desktop' => array(
					'color' => '',
				),
			),
			'transparent_header_account_color' => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'transparent_header_account_background' => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'transparent_header_navigation_color'              => array(
				'color'  => 'palette9',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'transparent_header_account_in_color' => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'transparent_header_account_in_background' => array(
				'color' => 'palette2',
				'hover' => 'palette9',
			),
			'transparent_header_cart_color'              => array(
                        'color'           => 'palette2',
                        'hover'           => 'palette2',
                        'background'      => 'palette9',
                        'backgroundHover' => 'palette9',
                    ),
			'transparent_header_button_color'              => array(
                        'color'           => 'palette9',
                        'hover'           => 'palette9',
                        'background'      => 'palette2',
                        'backgroundHover' => 'palette1',
                        'border'          => '',
                        'borderHover'     => '',
                    ),
			// Sticky Header.
			'mobile_header_sticky'             => 'main',
			'mobile_header_sticky_shrink'      => true,
			'mobile_header_reveal_scroll_up'   => false,
			'mobile_header_sticky_main_shrink' => array(
				'size' => 60,
				'unit' => 'px',
			),
			'header_sticky'             => 'main',
			'header_sticky_custom_logo'        => true,
			'header_reveal_scroll_up'   => false,
			'header_sticky_shrink'      => true,
			'header_sticky_background'                => array(
				'desktop' => array(
					'color' => 'palette1',
				),
			),
			'header_sticky_main_shrink' => array(
				'size' => 60,
				'unit' => 'px',
			),
			'header_sticky_bottom_border'   => array(
				'desktop' => array(
				'width' => '0',
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
				),
			),
			'header_sticky_navigation_color'              => array(
				'color'  => 'palette9',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'header_sticky_button_color'              => array(
				'color'           => 'palette2',
				'hover'           => 'palette1',
				'background'      => 'palette9',
				'backgroundHover' => 'palette3',
				'border'          => '',
				'borderHover'     => '',
			),
			'sticky_header_contact_color' => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'header_sticky_logo_width'         => array(
				'size' => array(
					'mobile'  => '85',
					'tablet'  => '90',
					'desktop' => '97',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'header_sticky_social_color'              => array(
				'color'           => 'palette1',
				'hover'           => '',
				'background'      => '',
				'backgroundHover' => '',
				'border'          => '',
				'borderHover'     => '',
			),
			// Footer.
			'footer_items'       => array(
				'top' => array(
					'top_1' => array(),
					'top_2' => array(),
					'top_3' => array(),
					'top_4' => array(),
					'top_5' => array(),
				),
				'middle' => array(
					'middle_1' => array( 'footer-widget1' , 'footer-social'),
					'middle_2' => array( 'footer-widget2' ),
					'middle_3' => array( 'footer-widget3' ),
					'middle_4' => array( 'footer-widget4' ),
					'middle_5' => array(),
				),
				'bottom' => array(
					'bottom_1' => array( 'footer-html' ),
					'bottom_2' => array(),
					'bottom_3' => array(),
					'bottom_4' => array(),
					'bottom_5' => array(),
				),
			),
			'footer_wrap_background' => array(
				'desktop' => array(
					'color' => 'palette2',
				),
			),
			// Footer Top.
			'footer_top_column_spacing' => array(
				'size' => array(
					'mobile'  => '10',
					'tablet'  => '',
					'desktop' => '',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_top_widget_spacing' => array(
				'size' => array(
					'mobile'  => '10',
					'tablet'  => '',
					'desktop' => '',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_top_top_spacing' => array(
				'size' => array(
					'mobile'  => '30',
					'tablet'  => '50',
					'desktop' => '95',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_top_bottom_spacing' => array(
				'size' => array(
					'mobile'  => '30',
					'tablet'  => '50',
					'desktop' => '88',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_top_columns' => '2',
			'footer_top_layout'  => array(
				'mobile'  => 'row',
				'tablet'  => 'row',
				'desktop' => 'equal',
			),
			'footer_top_contain'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'contained',
			),
			'footer_top_background' => array(
				'desktop' => array(
					'color' => '',
				),
			),
			'footer_top_widget_title'  => array(
				'size' => array(
					'desktop' => '50',
					'mobile' => '27',
				),
				'lineHeight' => array(
					'desktop' => '60',
					'mobile' => '37',
				),
				'lineType' => 'px',
				'family'  => 'Oswald',
				'transform'  => 'uppercase',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette9',
			),
			'footer_top_widget_content' => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
			),
			'footer_top_link_colors' => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'footer_top_direction'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'column',
			),
			'footer_top_bottom_border'    => array(
				'desktop' => array(
					'width' => 1,
					'unit'  => 'px',
					'style' => 'solid',
					'color'  => 'palette6',
					),
			),
			'footer_top_link_style' => 'noline',
			// Footer Middle.
			'footer_middle_height' => array(
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
			),
			'footer_middle_top_spacing' => array(
				'size' => array(
					'mobile'  => '50',
					'tablet'  => '80',
					'desktop' => '120',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_middle_bottom_spacing' => array(
				'size' => array(
					'mobile'  => '50',
					'tablet'  => '80',
					'desktop' => '120',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_middle_column_spacing' => array(
				'size' => array(
					'mobile'  => '30',
					'tablet'  => '30',
					'desktop' => '36',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_middle_columns' => '4',
			'footer_middle_background' => array(
				'desktop' => array(
					'color' => '',
				),
			),
			'footer_middle_bottom_border' => array(),
			'footer_middle_column_border' => array(
				'desktop' => array(
					'width' => 0,
					'unit'  => 'px',
					'style' => 'solid',
					'color'  => 'palette6',
					),
			),
			'footer_middle_widget_title'  => array(
				'size' => array(
					'desktop' => '24',
					'tablet' => '24',
					'mobile' => '20',
				),
				'lineHeight' => array(
					'desktop' => '36',
					'tablet' => '36',
					'mobile' => '30',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'Oswald',
				'transform'  => 'uppercase',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette9',
			),
			'footer_middle_widget_content' => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '26',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => 0,
				),
				'spacingType' => 'px',
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
				'transform' => 'none',
			),
			'footer_middle_link_colors' => array(
				'color' => 'palette9',
				'hover' => 'palette1',
			),
			'footer_middle_widget_spacing' => array(
				'size' => array(
					'mobile'  => '10',
					'tablet'  => '15',
					'desktop' => '30',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_middle_layout'  => array(
				'mobile'  => 'row',
				'tablet'  => 'two-grid',
				'desktop' => 'equal',
			),
			'footer_middle_direction'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'column',
			),
			'footer_middle_link_style' => 'noline',
			'footer_middle_top_border' => array(
				'desktop' => array(
				'width' => 0,
				'unit'  => 'px',
				'style' => 'solid',
				'color'  => 'palette6',
				),
			),
			'footer_middle_contain'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'standard',
			),
			// Footer Bottom.
			'footer_bottom_columns' => '1',
			'footer_bottom_layout'  => array(
				'mobile'  => 'row',
				'tablet'  => 'row',
				'desktop' => 'row',
			),
			'footer_bottom_background' => array(
				'desktop' => array(
					'color' => '',
				),
			),
			'footer_bottom_contain'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'standard',
			),
			'footer_bottom_widget_title'  => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'transform'  => 'uppercase',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
			),
			'footer_bottom_top_border' => array(
				'desktop' => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color'  => 'palette9',
				),
			),
			'footer_bottom_widget_content' => array(
				'size' => array(
					'desktop' => '14',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '500',
				'variant' => '500',
				'color'   => 'palette9',
			),
			'footer_bottom_widget_content_color' => array(
				'color' => 'palette9',
				'hover' => '',
			),
			'footer_bottom_top_spacing' => array(
				'size' => array(
					'mobile'  => '10',
					'tablet'  => '15',
					'desktop' => '',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_bottom_bottom_spacing' => array(
				'size' => array(
					'mobile'  => '10',
					'tablet'  => '',
					'desktop' => '',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'footer_bottom_height' => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => '85',
				),
			),
			// Footer Navigation.
			'footer_navigation_typography'            => array(
				'size' => array(
					'desktop' => '20',
				),
				'lineHeight' => array(
					'desktop' => '30',
				),
				'lineType' => 'px',
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '500',
				'variant' => '500',
				'transform' => 'uppercase'
			),
			'footer_navigation_spacing'            => array(
				'size' => 90,
				'unit' => 'px',
			),
			'footer_navigation_vertical_spacing'   => array(
				'size' => 40,
				'unit' => 'px',
			),
			'footer_navigation_stretch' => false,
			'footer_navigation_style'   => 'standard',
			'footer_navigation_color'   => array(
				'color'  => 'palette1',
				'hover'  => 'palette2',
				'active' => 'palette2',
			),
			'footer_navigation_background'              => array(
				'color'  => '',
				'hover'  => '',
				'active' => '',
			),
			'footer_navigation_align'         => array(
				'mobile'  => 'center',
				'tablet'  => 'left',
				'desktop' => '',
			),
			'footer_navigation_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'middle',
			),
			// Footer Social.
			'footer_social_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_social_items' => array(
				'items' => array(
					array(
						'id'      => 'instagram',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'instagramAlt',
						'label'   => 'Instagram',
					),
					array(
						'id'      => 'facebook',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'facebookAlt',
						'label'   => 'Facebook',
					),	
					array(
						'id'      => 'youtube',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'youtubeAlt',
						'label'   => 'youtube',
					),
					array(
						'id'      => 'twitter',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 24,
						'icon'    => 'twitterAlt',
						'label'   => 'Twitter',
					),
				),
			),
			'footer_social_style'        => 'outline',
			'footer_social_show_label'   => false,
			'footer_social_item_spacing' => array(
				'size' => 20,
				'unit' => 'px',
			),
			'footer_social_icon_size' => array(
				'size' => 18,
				'unit' => 'px',
			),
			'footer_social_typography' => array(
				'size' => array(
					'desktop' => '',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'lineType' => '',
				'family'  => '',
				'google'  => false,
				'weight'  => '',
				'variant' => '',
				'transform' => '',
			),
			'footer_social_brand' => '',
			'footer_social_color' => array(
				'color' => 'palette9',
				'hover' => 'palette1',
			),
			'footer_social_background' => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'footer_social_margin' => array(
				'size'   => array( '15', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'footer_social_border_colors' => array(
				'color' => '',
				'hover' => '',
			),
			'footer_social_border' => array(
				'width' => 0,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6'
			),
			'footer_social_border_radius' => array(
				'size' => 0,
				'unit' => 'px',
			),
			'footer_social_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'middle',
			),
			// Footer Widget 1.
			'footer_widget1_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_widget1_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			// Footer Widget 2.
			'footer_widget2_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_widget2_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			// Footer Widget 3.
			'footer_widget3_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_widget3_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			// Footer Widget 4.
			'footer_widget4_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_widget4_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			// Footer Widget 5.
			'footer_widget5_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			'footer_widget5_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			// Footer Widget 6.
			'footer_widget6_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			'footer_widget6_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'left',
			),
			// Footer HTML.
			'footer_html_content'    => '{copyright} {year} - All Rights Reserved | Created By Webswaala',
			'footer_html_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette9',
			),
			'footer_html_link_color'              => array(
				'color' => '',
				'hover' => '',
			),
			'footer_html_link_style'    => 'normal',
			'footer_html_margin' => array(
				'size'   => array( '0', '0', '0','0' ),
				'unit'   => 'em',
				'locked' => true,
			),
			'footer_html_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'center',
			),
			'footer_html_vertical_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'middle',
			),
			// Comments.
			// 404.
			// Page Layout.
			'page_title_meta_font'   => array(
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
			),
			'page_title_font'   => array(
				'size' => array(
					'mobile' => '30',
					'tablet' => '60',
					'desktop' => '70',
				),
				'lineHeight' => array(
					'mobile' => '40',
					'tablet' => '70',
					'desktop' => '80',
				),
				'lineType' => 'px',
				'family'  => 'Oswald',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette9',
				'transform' => 'uppercase'
			),
			'page_title_breadcrumb_color' => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'page_layout'             => 'normal',
			'page_title_background'   => array(
				'desktop' => array(
					'color' => 'palette2',
				),
			),
			'page_title_breadcrumb_font'   => array(
				'size' => array(
					'desktop' => '14',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'plaette9',
			),
			'page_title_height'       => array(
				'size' => array(
					'mobile'  => '180',
					'tablet'  => '300',
					'desktop' => '400',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			// Post Layout.
			'post_layout'             => 'normal',
			'post_content_style'      => 'boxed',
			'post_comments'           => true,
			'post_vertical_padding'   => 'bottom',
			'post_title_font'   => array(
				'size' => array(
					'mobile' => '22',
					'tablet' => '40',
					'desktop' => '55',
				),
				'lineHeight' => array(
					'mobile' => '32',
					'tablet' => '50',
					'desktop' => '70',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'spacingType' => 'px',
				'family'  => 'inherit',
				'google'  => false,
				'variant' => '700',
				'weight'  => '700',
				'color'   => 'palette1',
				'transform' => 'uppercase'
			),
			'post_title_excerpt_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
			),
			'post_title_element_meta' => array(
				'id'                     => 'meta',
				'enabled'                => true,
				'divider'                => 'vline',
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
				'comments'               => true,
				'commentsCondition'      => false,
			),
			'post_title_align'         => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => '',
			),
			'post_related_background' => '',
			'post_tags'               => true,
			'post_author_box'         => false,
			'post_author_box_style'   => 'normal',
			'post_author_box_link'    => true,
			'post_feature'            => true,
			'post_feature_position'   => 'behind',
			'post_feature_caption'    => false,
			'post_feature_ratio'      => '1-2',
			'post_feature_width'      => 'full',
			'post_background'         => '',
			'post_content_background' => '',
			'post_title'              => true,
			'post_title_layout'       => 'normal',
			'post_title_category_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
				'transform' => 'uppercase'
			),
			'post_title_category_color' => array(
				'color' => 'palette3',
				'hover' => '',
			),
			'post_title_meta_color' => array(
                        'color' => 'palette1',
                        'hover' => 'palette2',
                    ),
			// enable_preload css style sheets.
			'breadcrumb_home_icon' => true,
			// Post Archive.
			'post_archive_title_elements'      => array( 'title','breadcrumb', 'description' ),
			'post_archive_title_element_title' => array(
				'enabled' => true,
			),
			'post_archive_title_element_breadcrumb' => array(
				'enabled' => true,
				'show_title' => true,
			),
			'post_archive_title_color' => array(
				'color' => 'palette9',
			),
			'post_archive_title_description_color' => array(
				'color' => 'palette9',
			),
			'post_archive_layout'               => 'left',
			'post_archive_content_style'        => 'unboxed',
			'post_archive_columns'              => '2',
			'post_archive_item_image_placement' => 'beside',
			'post_archive_item_vertical_alignment' => 'center',
			'post_archive_sidebar_id'           => 'sidebar-primary',
			'post_archive_elements'             => array( 'feature', 'categories', 'meta', 'title', 'excerpt', 'readmore' ),
			'post_archive_element_categories'   => array(
				'enabled' => false,
				'style'   => 'normal',
				'divider' => 'vline',
			),
			'post_archive_title_height'       => array(
				'size' => array(
					'mobile'  => '200',
					'tablet'  => '300',
					'desktop' => '400',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'post_archive_element_title' => array(
				'enabled' => true,
			),
			'post_archive_element_meta' => array(
				'id'                     => 'meta',
				'enabled'                => true,
				'divider'                => 'vline',
				'author'                 => false,
				'authorLink'             => false,
				'authorImage'            => false,
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
			),
			'post_archive_element_feature' => array(
				'enabled'   => true,
				'ratio'     => '1-2',
				'size'      => 'medium_large',
				'imageLink' => true,
			),
			'post_archive_element_excerpt' => array(
				'enabled'     => true,
				'words'       => 15,
				'fullContent' => false,
			),
			'post_archive_item_meta_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'transform' => 'none',
			),
			'post_archive_item_title_font'   => array(
				'size' => array(
					'desktop' => '24',
					'mobile' => '20',
				),
				'lineHeight' => array(
					'desktop' => '36',
					'mobile' => '30',
				),
				'lineType' => 'px',
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'color' => 'palette1',
				'transform' => 'uppercase',
			),
			'post_archive_item_category_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'inherit',
				'google'  => false,
				'variant' => '400',
				'weight'  => '400',
			),
			'post_archive_item_meta_color' => array(
				'color' => 'palette1',
				'hover' => 'palette2',
			),
			'post_archive_title_breadcrumb_color' => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'post_archive_title_overlay_color'              => array(
				'color' => '',
			),
			'post_archive_title_background'    => array(
				'desktop' => array(
					'color' => 'palette1',
				),
			),
			// Search Results.
			'search_archive_title'              => true,
			'search_archive_title_layout'       => 'above',
			'search_archive_title_inner_layout' => 'standard',
			'search_archive_title_height'       => array(
				'size' => array(
					'mobile'  => '180',
					'tablet'  => '300',
					'desktop' => '400',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'search_archive_title_background'    => array(
				'desktop' => array(
					'color' => 'palette1',
				),
			),
			'search_archive_title_align'        => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'center',
			),
			'search_archive_title_overlay_color'              => array(
				'color' => '',
			),
			'search_archive_title_breadcrumb_color' => array(
				'color' => '',
				'hover' => '',
			),
			'search_archive_title_color' => array(
				'color' => 'palette9',
			),
			'search_archive_description_color' => array(
				'color' => '',
				'hover' => '',
			),
			'search_archive_layout'               => 'normal',
			'search_archive_content_style'        => 'unboxed',
			'search_archive_columns'              => '3',
			'search_archive_item_image_placement' => 'above',
			'search_archive_sidebar_id'           => 'sidebar-primary',
			'search_archive_elements'             => array( 'feature', 'categories', 'title', 'meta', 'excerpt', 'readmore' ),
			'search_archive_element_categories'   => array(
				'enabled' => true,
				'style'   => 'normal',
				'divider' => 'vline',
			),
			'search_archive_element_title' => array(
				'enabled' => true,
			),
			'search_archive_element_meta' => array(
				'id'                     => 'meta',
				'enabled'                => true,
				'divider'                => 'dot',
				'author'                 => true,
				'authorLink'             => true,
				'authorImage'            => false,
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
			),
			'search_archive_element_feature' => array(
				'enabled' => true,
				'ratio'   => '		',
				'size'    => 'medium_large',
			),
			'search_archive_element_excerpt' => array(
				'enabled'     => true,
				'words'       => 16,
				'fullContent' => false,
			),
			'search_archive_element_readmore' => array(
				'enabled' => true,
				'label'   => '',
			),
			'search_archive_item_title_font'   => array(
				'size' => array(
					'desktop' => '24',
					'mobile' => '20',
				),
				'lineHeight' => array(
					'desktop' => '36',
					'mobile' => '30',
				),
				'lineType' => 'px',
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'transform' => 'uppercase',
			),
			'search_archive_item_category_color' => array(
				'color' => '',
				'hover' => '',
			),
			'search_archive_item_category_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'transform' => 'none',
			),
			'search_archive_item_meta_color' => array(
				'color' => 'palette1',
				'hover' => '',
			),
			'search_archive_item_meta_font'   => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'letterSpacing' => array(
					'desktop' => '0',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'transform' => 'none',
			),
			'search_archive_background'         => '',
			'search_archive_content_background' => '',
			'search_archive_column_layout'      => 'grid',
			// Product Archive Controls.
			'product_archive_toggle' => true,
			'product_archive_show_order' => true,
			'product_archive_show_results_count' => true,
			'product_archive_style'  => 'action-on-hover',
			'product_archive_image_hover_switch' => 'flip',
			'product_archive_button_style'       => 'text',
			'product_archive_button_align'       => false,
			'product_archive_title'              => true,
			'product_archive_title_layout'       => 'above',
			'product_archive_title_inner_layout' => 'standard',
			'product_archive_title_height'       => array(
				'size' => array(
					'mobile'  => '200',
					'tablet'  => '300',
					'desktop' => '400',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
			),
			'product_archive_title_elements'      => array( 'title', 'breadcrumb', 'description' ),
			'product_archive_title_element_title' => array(
				'enabled' => true,
			),
			'product_archive_title_element_breadcrumb' => array(
				'enabled' => false,
				'show_title' => true,
			),
			'product_archive_title_element_description' => array(
				'enabled' => true,
			),
			'product_archive_title_background'    => array(
				'desktop' => array(
					'color' => 'palette2',
				),
			),
			'product_archive_title_align'        => array(
				'mobile'  => '',
				'tablet'  => '',
				'desktop' => 'center',
			),
			'product_archive_title_overlay_color'              => array(
				'color' => '',
			),
			'product_archive_title_breadcrumb_color' => array(
				'color' => '',
				'hover' => '',
			),
			'product_archive_title_heading_font' => array(
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
				'transform' => '',
			),
			'product_archive_title_color' => array(
				'color' => 'palette9',
			),
			'product_archive_description_color' => array(
				'color' => '',
				'hover' => '',
			),
			'product_archive_layout'             => 'normal',
			'product_archive_content_style'      => 'boxed',
			'product_archive_sidebar_id'         => 'sidebar-primary',
			'product_archive_title_font'   => array(
				'size' => array(
					'desktop' => '30',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Barlow Condensed',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette1',
				'transform' => 'uppercase',
			),
			'product_archive_price_font'   => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Ubuntu',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
			),
			// Archive Product Button.
			// Product Controls.
			'custom_quantity'                => true,
			'product_layout'             => 'narrow',
			'product_content_elements'           => array( 'category', 'title', 'rating', 'price', 'excerpt', 'add_to_cart', 'extras', 'payments', 'product_meta', 'share' ),
			'product_content_element_category' => array(
				'enabled' => true,
			),
			'product_content_element_title' => array(
				'enabled' => true,
			),
			'product_content_element_rating' => array(
				'enabled' => true,
			),
			'product_content_element_price' => array(
				'enabled' => true,
				'show_shipping' => true,
				'shipping_statement' => __( '& Free Shipping', 'thewebs' ),
			),
			'product_content_element_excerpt' => array(
				'enabled' => true,
			),
			'product_content_element_add_to_cart' => array(
				'enabled'     => true,
				'button_size' => 'medium-large',
			),
			'product_content_element_extras' => array(
				'enabled'   => true,
				'title'     => __( 'Free shipping on orders over $50!', 'thewebs' ),
				'feature_1' => __( 'Satisfaction Guaranteed', 'thewebs' ),
				'feature_2' => __( 'No Hassle Refunds', 'thewebs' ),
				'feature_3' => __( 'Secure Payments', 'thewebs' ),
				'feature_4' => '',
				'feature_5' => '',
				'feature_1_icon' => 'checkbox_alt',
				'feature_2_icon' => 'checkbox_alt',
				'feature_3_icon' => 'checkbox_alt',
				'feature_4_icon' => 'checkbox_alt',
				'feature_5_icon' => 'checkbox_alt',
			),
			'product_content_element_payments' => array(
				'enabled' => true,
				'title'     => __( 'GUARANTEED SAFE CHECKOUT', 'thewebs' ),
				'visa' => true,
				'mastercard' => true,
				'amex' => true,
				'discover' => true,
				'paypal' => true,
				'applepay' => true,
				'stripe' => true,
				'card_color' => 'inherit',
				'custom_enable_01' => false,
				'custom_img_01' => '',
				'custom_id_01' => '',
				'custom_enable_02' => false,
				'custom_img_02' => '',
				'custom_id_02' => '',
				'custom_enable_03' => false,
				'custom_img_03' => '',
				'custom_id_03' => '',
				'custom_enable_04' => false,
				'custom_img_04' => '',
				'custom_id_04' => '',
				'custom_enable_05' => false,
				'custom_img_05' => '',
				'custom_id_05' => '',
			),
			'product_title_font'   => array(
				'size' => array(
					'desktop' => '50',
					'mobile' => '27',
				),
				'lineHeight' => array(
					'desktop' => '60',
					'mobile' => '37',
				),
				'lineType' => 'px',
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette1',
			),
			'product_single_category_font'   => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
			),
			'product_title_breadcrumb_font'   => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '1.5',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color'   => 'palette1',
			),
			// Store Notice:
			// Woo Account
			// Heroic Knowledge Base.
			// Header Cart.
			'header_cart_style' => 'slide',
			'header_cart_show_total' => false,
			'header_cart_icon' => 'shopping-cart',
			'header_cart_icon_size'   => array(
				'size' => '15',
				'unit' => 'px',
			),
			'header_cart_color'              => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'header_cart_background'              => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'header_cart_total_color'              => array(
				'color' => 'palette1',
				'hover' => 'palette1',
			),
			'header_cart_total_background'              => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'header_cart_typography'            => array(
				'size' => array(
					'desktop' => '13',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform'  => 'uppercase',
			),
			'header_cart_padding' => array(
				'size'   => array( '7' , '7', '7', '7' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// Mobile Header Cart.
			'header_mobile_cart_label' => '',
			'header_mobile_cart_show_total' => false,
			'header_mobile_cart_style' => 'slide',
			'header_mobile_cart_popup_side' => 'right',
			'header_mobile_cart_icon' => 'shopping-cart',
			'header_mobile_cart_icon_size'   => array(
				'size' => '',
				'unit' => 'em',
			),
			'header_mobile_cart_color'              => array(
				'color' => 'palette9',
				'hover' => 'palette2',
			),
			'header_mobile_cart_background'              => array(
				'color' => '',
				'hover' => '',
			),
			'header_mobile_cart_total_color'              => array(
				'color' => '',
				'hover' => '',
			),
			'header_mobile_cart_total_background'              => array(
				'color' => '',
				'hover' => '',
			),
			'header_mobile_cart_typography'            => array(
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
			),
			'header_mobile_cart_padding' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'em',
				'locked' => false,
			),
			// LifterLMS Course
			// LifterLMS Lesson
			// LifterLMS Quiz
			// LifterLMS Quiz
			// LifterLMS Archive
			// LifterLMS Member Archive
			// Dashboard Layout
			// Learn Dash Course Grid.
			// Learn Dash Course Archive.
			// Learn Dash Course
			// Learndash Lessons.
			// Learndash Quiz.
			// Learndash Topics.
			// Learn Dash Groups
			// Learn Dash essays
			// Learndash Assignment.
			// MISC

			// ----------- PRO -----------
			// Header Mobile Divider.
			'header_mobile_divider_border' => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			'header_mobile_divider_height' => array(
				'size' => 20,
				'unit' => 'px',
			),
			'header_mobile_divider_margin' => array(
				'size'   => array( '', '5', '', '5' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'transparent_header_mobile_divider_color' => array(
				'color' => '',
			),
			// Header Mobile Divider 2.
			'header_mobile_divider2_border' => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			'header_mobile_divider2_height' => array(
				'size' => 20,
				'unit' => 'px',
			),
			'header_mobile_divider2_margin' => array(
				'size'   => array( '', '5', '', '5' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'transparent_header_mobile_divider2_color' => array(
				'color' => '',
			),
			// pro Header Search Bar.
			'header_search_bar_width' => array(
				'size' => '183',
				'unit' => 'px',
			),
			'header_search_bar_border' => array(
				'width' => '0',
				'unit'  => 'px',
				'style' => 'soild',
				'color' => 'palette2',
			),
			'header_search_bar_color'       => array(
				'color'  => 'palette9',
				'hover'  => 'palette9',
			),
			'header_search_bar_background'       => array(
				'color'  => 'transparent',
				'hover'  => '',
			),
			'header_search_bar_typography'        => array(
				'size' => array(
					'desktop' => '16',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'inherit',
				'google'  => false,
				'weight'  => '400',
				'variant' => '400',
				'color' => 'palette9',
			),
			'header_search_bar_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'em',
				'locked' => true,
			),
			// pro Mobile HTML.
			'header_account_preview'                 => 'in',
			'header_account_icon'                    => 'account',
			'header_account_link'                    => '',
			'header_account_style'                   => 'label',
			'header_account_action'                  => 'modal',
			'header_account_dropdown_direction'      => 'right',
			'header_account_modal_registration'      => true,
			'header_account_modal_registration_link' => '',
			'header_account_label'                   => __( 'sign in', 'thewebs-pro' ),
			'header_account_icon_size'               => array(
				'size' => '13',
				'unit' => 'px',
			),
			'header_account_color' => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'header_account_background' => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'header_account_radius' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_account_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'color'   => 'palette9',
			),
			'header_account_padding' => array(
				'size'   => array( '14.5', '51.5', '14.5', '51.5' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_account_margin' => array(
				'size'   => array( '', '0', '', '0' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'header_account_in_icon'                    => 'account',
			'header_account_in_link'                    => '',
			'header_account_in_action'                  => 'link',
			'header_account_in_dropdown_source'         => 'navigation',
			'header_account_in_dropdown_direction'      => 'right',
			'header_account_in_style'                   => 'label',
			'header_account_in_label'                   => __( 'sign in', 'thewebs-pro' ),
			'header_account_in_icon_size'               => array(
				'size' => '15',
				'unit' => 'px',
			),
			'header_account_in_color' => array(
				'color' => 'palette1',
				'hover' => 'palette2',
			),
			'header_account_in_typography' => array(
				'size' => array(
					'desktop' => '15',
				),
				'lineHeight' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '600',
				'variant' => '600',
				'transform' => 'uppercase',
 			),
			 'header_account_in_color' => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'header_account_in_background' => array(
				'color' => 'palette2',
				'hover' => 'palette2',
			),
			'header_account_in_radius' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_account_in_padding' => array(
				'size'   => array( '14.5', '51.5', '14.5', '51.5' ),
				'unit'   => 'px',
				'locked' => true,
			),
			'header_account_in_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// pro Widget Toggle.
			'header_toggle_widget_icon_size'   => array(
				'size' => 25,
				'unit' => 'px',
			),
			'header_toggle_widget_color'              => array(
				'color' => 'palette9',
				'hover' => 'palette9',
			),
			'header_toggle_widget_background'              => array(
				'color' => 'palette1',
				'hover' => '',
			),
			'header_toggle_widget_layout'     => 'fullwidth',
			'header_toggle_widget_padding' => array(
				'size'   => array( 2.7, 3.9, 2.7, 3.9 ),
				'unit'   => 'em',
				'locked' => false,
			),
			// pro Header Divider.
			'header_divider_height' => array(
				'size' => 22,
				'unit' => 'px',
			),
			'header_divider_margin' => array(
				'size'   => array( '0', '30', '0', '30' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'header_divider_border' => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => '#f04a4a',
			),
			// pro Header Divider2.
			'header_divider2_border' => array(
				'width' => 1,
				'unit'  => 'px',
				'style' => 'solid',
				'color' => 'palette6',
			),
			'header_divider2_height' => array(
				'size' => 20,
				'unit' => 'px',
			),
			'header_divider2_margin' => array(
				'size'   => array( '', '5', '', '5' ),
				'unit'   => 'px',
				'locked' => false,
			),
			'transparent_header_divider2_color' => array(
				'color' => '',
			),
			// pro Header contact
			'header_contact_link_style' => 'plain',
			'header_contact_items' => array(
				'items' => array(
					array(
						'id'      => 'phone',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 15,
						'link'     => '#',
						'icon'    => '',
						'label'   => '+555 555 1234',
					),
				),
			),
			'header_contact_color' => array(
				'color'  => 'palette3',
				'hover' => 'palette9',
			),
			'transparent_header_contact_color' => array(
			'color' => 'palette3',
			'hover' => 'palette1',
		),
		'sticky_header_contact_color' => array(
			'color' => 'palette9',
			'hover' => 'palette2',
		),
			'header_contact_item_spacing'=> array(
				'size' => 29,
				'unit' => 'px',
			),
			'header_contact_icon_size' => array(
				'size' => 15,
				'unit' => 'px',
			),
			'header_contact_typography' => array(
				'size' => array(
					'mobile'  => '',
					'tablet'  => '',
					'desktop' => '17',
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
				'lineheight' => array(
					'mobile'  => 22,
					'tablet'  => 22,
					'desktop' => 22,
				),
				'unit' => array(
					'mobile'  => 'px',
					'tablet'  => 'px',
					'desktop' => 'px',
				),
				'letterSpacing' => array(
					'desktop' => '',
				),
				'family'  => 'Lato',
				'google'  => false,
				'weight'  => '700',
				'variant' => '700',
				'transform' => 'uppercase',
				'color'  => 'palette3',
			),
			'header_contact_margin' => array(
				'size'   => array( '', '', '', '' ),
				'unit'   => 'px',
				'locked' => false,
			),
			// pro Header Mobile Contact.
			'header_mobile_contact_items' => array(
				'items' => array(
					array(
						'id'      => 'phone',
						'enabled' => true,
						'source'  => 'icon',
						'url'     => '',
						'imageid' => '',
						'width'   => 18,
						'link'     => '',
						'icon'    => 'phone',
						'label'   => '+1800-234-67899',
					),
				),	
			),
			// dark mode
			'dark_mode_enable'             => false,
			'dark_mode_default'            => 'light',
			'dark_mode_os_aware'           => false,
			'dark_mode_dark_palette'       => 'second-palette',
			'dark_mode_switch_show'        => true,
			'dark_mode_switch_type'        => 'icon',
			'dark_mode_switch_style'       => 'switch',
			'dark_mode_switch_position'    => 'left',
			'dark_mode_logo'               => '',
			'dark_mode_custom_logo'        => true,
			'dark_mode_mobile_logo'        => '',
			'dark_mode_mobile_custom_logo' => false,
			'dark_mode_learndash_enable'   => false,
			'dark_mode_learndash_lesson_only' => false,
			'dark_mode_learndash_lesson_logo' => '',
			'dark_mode_switch_tooltip'     => false,
			'dark_mode_light_switch_title' => esc_html__( 'Light', 'thewebs-pro' ),
			'dark_mode_dark_switch_title'  => esc_html__( 'Dark', 'thewebs-pro' ),
			'dark_mode_light_color'        => '#FFFFFF',
			'dark_mode_light_icon'         => 'sun',
			'dark_mode_dark_color'         => '#222223',
			'dark_mode_colors'             => array(
			'light' => '#FFFFFF',
			'dark' => '#222223',
			),
			'dark_mode_dark_icon'          => 'moon',
			'dark_mode_icon_size'   => array(
			'size' => array(
			'desktop' => 1.2,
			),
			'unit' => array(
			'desktop' => 'em',
			),
			),
			'dark_mode_typography'            => array(
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
			),
			'dark_mode_switch_visibility' => array(
			'desktop' => true,
			'tablet'  => true,
			'mobile'  => false,
			),
			'dark_mode_switch_side_offset'   => array(
			'size' => array(
			'mobile'  => '',
			'tablet'  => '',
			'desktop' => 30,
			),
			'unit' => array(
			'mobile'  => 'px',
			'tablet'  => 'px',
			'desktop' => 'px',
			),
			),
			'dark_mode_switch_bottom_offset'   => array(
			'size' => array(
			'mobile'  => '',
			'tablet'  => '',
			'desktop' => 30,
			),
			'unit' => array(
			'mobile'  => 'px',
			'tablet'  => 'px',
			'desktop' => 'px',
			),
			),
			'header_dark_mode_switch_type'        => 'icon',
			'header_dark_mode_switch_style'       => 'switch',
			'header_dark_mode_switch_tooltip'     => false,
			'header_dark_mode_light_switch_title' => esc_html__( 'Light', 'thewebs-pro' ),
			'header_dark_mode_dark_switch_title'  => esc_html__( 'Dark', 'thewebs-pro' ),
			'header_dark_mode_light_color'        => '#F7FAFC',
			'header_dark_mode_light_icon'         => 'sun',
			'header_dark_mode_dark_color'         => '#2D3748',
			'header_dark_mode_colors'             => array(
			'light' => '#F7FAFC',
			'dark' => '#2D3748',
			),
			'header_dark_mode_dark_icon'          => 'moon',
			'header_dark_mode_icon_size'   => array(
			'size' => array(
			'desktop' => 1.2,
			),
			'unit' => array(
			'desktop' => 'em',
			),
			),
			'header_dark_mode_typography'            => array(
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
			),
			'header_dark_mode_switch_margin' => array(
			'size'   => array( '', '', '', '' ),
			'unit'   => 'px',
			'locked' => false,
			),
			'mobile_dark_mode_switch_type'        => 'icon',
			'mobile_dark_mode_switch_style'       => 'switch',
			'mobile_dark_mode_light_switch_title' => esc_html__( 'Light', 'thewebs-pro' ),
			'mobile_dark_mode_dark_switch_title'  => esc_html__( 'Dark', 'thewebs-pro' ),
			'mobile_dark_mode_light_color'        => '#F7FAFC',
			'mobile_dark_mode_light_icon'         => 'sun',
			'mobile_dark_mode_dark_color'         => '#2D3748',
			'mobile_dark_mode_colors'             => array(
			'light' => '#F7FAFC',
			'dark' => '#2D3748',
			),
			'mobile_dark_mode_dark_icon'          => 'moon',
			'mobile_dark_mode_icon_size'   => array(
			'size' => array(
			'desktop' => 1.2,
			),
			'unit' => array(
			'desktop' => 'em',
			),
			),
			'mobile_dark_mode_typography'            => array(
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
			),
			'mobile_dark_mode_switch_margin' => array(
			'size'   => array( '', '', '', '' ),
			'unit'   => 'px',
			'locked' => false,
			),
			'footer_dark_mode_switch_type'        => 'icon',
			'footer_dark_mode_switch_style'       => 'switch',
			'footer_dark_mode_light_switch_title' => esc_html__( 'Light', 'thewebs-pro' ),
			'footer_dark_mode_dark_switch_title'  => esc_html__( 'Dark', 'thewebs-pro' ),
			'footer_dark_mode_light_color'        => '#F7FAFC',
			'footer_dark_mode_light_icon'         => 'sun',
			'footer_dark_mode_dark_color'         => '#2D3748',
			'footer_dark_mode_switch_tooltip'     => false,
			'footer_dark_mode_colors'             => array(
			'light' => '#F7FAFC',
			'dark' => '#2D3748',
			),
			'footer_dark_mode_dark_icon'          => 'moon',
			'footer_dark_mode_icon_size'   => array(
			'size' => array(
			'desktop' => 1.2,
			),
			'unit' => array(
			'desktop' => 'em',
			),
			),
			'footer_dark_mode_typography'            => array(
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
			),
			'footer_dark_mode_switch_margin' => array(
			'size'   => array( '', '', '', '' ),
			'unit'   => 'px',
			'locked' => false,
			),
			// woocommerce addon
			'product_sticky_add_to_cart' => true,
			'product_sticky_add_to_cart_placement' => 'footer',
			'product_sticky_mobile_add_to_cart' => false,
			'product_sticky_mobile_add_to_cart_placement' => 'footer',
			'product_archive_shop_custom' => false,
			'cart_pop_show_free_shipping' => true,
			'cart_pop_free_shipping_price' => 100,
			'cart_pop_free_shipping_message' => 'You\'re {cart_difference} away from free shipping',
			'cart_pop_show_on_add' => false,
			'ajax_add_single_products' => false,
			// Widget Toggle.
			'product_archive_shop_filter_popout'     => true,
			'product_archive_shop_filter_active_top' => false,
			'product_archive_shop_filter_active_remove_all' => true,
			'product_archive_shop_filter_label'  => __( 'Filter', 'thewebs-pro' ),
			'product_archive_shop_filter_icon'   => 'listFilter',
			'product_archive_shop_filter_style'  => 'bordered',
			'product_archive_shop_filter_border' => array(
			'width' => 1,
			'unit'  => 'px',
			'style' => 'solid',
			'color' => 'palette6',
		),
			'product_archive_shop_filter_icon_size'   => array(
			'size' => 20,
			'unit' => 'px',
		),
			'product_archive_shop_filter_color'              => array(
			'color' => 'palette1',
			'hover' => 'palette1',
		),
			'product_archive_shop_filter_background'              => array(
			'color' => 'palette8',
			'hover' => 'palette8',
		),
			'product_archive_shop_filter_border_color'              => array(
			'color' => '',
			'hover' => '',
		),
			'product_archive_shop_filter_typography'            => array(
			'size' => array(
			'desktop' => 14,
	),
			'lineHeight' => array(
			'desktop' => '',
	),
			'family'  => 'inherit',
			'google'  => false,
			'weight'  => '',
			'variant' => '',
		),
			'product_archive_shop_filter_padding' => array(
			'size'   => array( 10, 15, 10, 15 ),
			'unit'   => 'px',
			'locked' => false,
		),
			'product_filter_widget_side'       => 'left',
			'product_filter_widget_layout'     => 'sidepanel',
			'product_filter_widget_pop_width'  => array(
			'size' => 400,
			'unit' => 'px',
		),
			'product_filter_widget_pop_background' => array(
			'desktop' => array(
			'color' => 'palette8',
	),
		),
			'product_filter_widget_close_color'  => array(
			'color' => 'palette1',
			'hover' => 'palette2',
		),
			// Header toggle Widget Area.
			'product_filter_widget_link_colors'       => array(
			'color'  => 'palette1',
			'hover'  => 'palette2',
		),
			'product_filter_widget_title'        => array(
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
			'color'   => 'palette1',
			),
			'product_filter_widget_content'        => array(
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
			'color'   => 'palette1',
			),
			'product_filter_widget_link_style' => 'plain',
			'product_filter_widget_padding' => array(
			'size'   => array( '', '', '', '' ),
			'unit'   => 'px',
			'locked' => false,
),
		);
		$defaults = array_merge(
			$defaults,
			$update_options
		);
		return $defaults;
	}
}

Custom_Theme::get_instance();