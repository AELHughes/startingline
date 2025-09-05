<?php if ( ! defined( 'ABSPATH' ) ) {
	exit;}

/**
 * Main plugin class.
 *
 * @link https://www.fooevents.com
 * @package fooevents-pdf-tickets
 */

// reference the Dompdf namespace.
use Dompdf\Dompdf;

/**
 * Main plugin class.
 */
class FooEvents_PDF_Tickets {

	/**
	 * Configuration object
	 *
	 * @var object $config contains paths and other configurations
	 */
	public $config;

	/**
	 * PDF helper object
	 *
	 * @var object $pdf_helper PDF helper object
	 */
	public $pdf_helper;

	/**
	 * Ticket helper object
	 *
	 * @var object $pdf_helper Ticket helper object
	 */
	public $ticket_helper;

	/**
	 * Update helper object
	 *
	 * @var object $update_helper Update helper object
	 */
	private $update_helper;

	/**
	 * On plugin load
	 */
	public function __construct() {

		add_action( 'admin_notices', array( $this, 'check_fooevents' ) );
		add_action( 'admin_notices', array( $this, 'check_gd' ) );
		add_action( 'woocommerce_settings_tabs_settings_woocommerce_events', array( $this, 'add_settings_tab_settings' ) );
		add_action( 'woocommerce_update_options_settings_woocommerce_events', array( $this, 'update_settings_tab_settings' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'process_meta_box' ) );
		add_action( 'admin_init', array( $this, 'register_scripts_and_styles' ) );
		add_action( 'init', array( $this, 'load_text_domain' ) );

		add_action( 'init', array( $this, 'fooevents_endpoints' ) );
		add_filter( 'woocommerce_account_menu_items', array( $this, 'add_tickets_account_menu_item' ) );
		add_filter( 'query_vars', array( $this, 'fooevents_query_vars' ), 0 );
		add_action( 'after_switch_theme', array( $this, 'fooevents_flush_rewrite_rules' ) );
		add_action( 'woocommerce_account_fooevents-tickets_endpoint', array( $this, 'fooevents_custom_endpoint_content' ) );

		add_action( 'admin_init', array( $this, 'register_settings_options' ) );

		add_action( 'trp_before_running_hooks', array( $this, 'translatepress_conflict_fixes' ), 10 );

		$this->plugin_init();
	}

	/**
	 * Register JavaScript and CSS file in WordPress admin
	 */
	public function register_scripts_and_styles() {

		wp_enqueue_style( 'fooevents-pdf-tickets-admin-style', $this->config->styles_path . 'pdf-tickets-admin.css', array(), $this->config->plugin_data['Version'] );
	}
	/**
	 * Disables TranslatePress Conflicting Hooks
	 *
	 * @param $trp_loader trp_loader object.
	 */
	public function translatepress_conflict_fixes( $trp_loader ) {

		$trp_loader->remove_hook( 'init', 'create_gettext_translated_global' );
		$trp_loader->remove_hook( 'shutdown', 'machine_translate_gettext' );
	}

	/**
	 * Processes the meta box form once the plubish / update button is clicked.
	 *
	 * @global object $woocommerce_errors
	 * @param int $post_id The post ID.
	 */
	public function process_meta_box( $post_id ) {

		global $woocommerce_errors;

		$nonce = '';
		if ( isset( $_POST['fooevents_pdf_tickets_options_nonce'] ) ) {
			$nonce = sanitize_text_field( wp_unslash( $_POST['fooevents_pdf_tickets_options_nonce'] ) );
		}

		/*
		if ( ! wp_verify_nonce( $nonce, 'fooevents_pdf_tickets_options' ) ) {
			die( esc_attr__( 'Security check failed - FooEvents PDF Tickets 0001', 'fooevents-pdf-tickets' ) );
		}*/

		if ( isset( $_POST['FooEventsPDFTicketsEmailText'] ) ) {

			update_post_meta( $post_id, 'FooEventsPDFTicketsEmailText', wp_kses_post( wp_unslash( $_POST['FooEventsPDFTicketsEmailText'] ) ) );

		}

		if ( isset( $_POST['FooEventsTicketFooterText'] ) ) {

			update_post_meta( $post_id, 'FooEventsTicketFooterText', wp_kses_post( wp_unslash( $_POST['FooEventsTicketFooterText'] ) ) );

		}
	}

	/**
	 * Generate the PDF theme options in a product's event options
	 *
	 * @param object $post post object.
	 * @return string
	 */
	public function generate_pdf_theme_options( $post ) {

		$woocommerce_events_pdf_ticket_theme = get_post_meta( $post->ID, 'WooCommerceEventsPDFTicketTheme', true );

		$themes = $this->get_pdf_ticket_themes();

		ob_start();

		require $this->config->template_path . 'product-pdf-ticket-theme-options.php';

		$pdf_ticket_theme_options = ob_get_clean();

		return $pdf_ticket_theme_options;
	}

	/**
	 * Returns an array of valid themes supporting PDF tickets
	 *
	 * @return array
	 */
	public function get_pdf_ticket_themes() {

		$valid_themes = array();

		foreach ( new DirectoryIterator( $this->config->theme_packs_path ) as $file ) {

			if ( $file->isDir() && ! $file->isDot() ) {

				$theme_name = $file->getFilename();

				$theme_path = $file->getPath();
				$theme_path = $theme_path . '/' . $theme_name;

				$theme_name_pretty = str_replace( '_', ' ', $theme_name );
				$theme_name_prep   = ucwords( $theme_name_pretty );

				if ( file_exists( $theme_path . '/header.php' ) && file_exists( $theme_path . '/footer.php' ) && file_exists( $theme_path . '/ticket.php' ) && file_exists( $theme_path . '/config.json' ) ) {

					$theme_config = file_get_contents( $theme_path . '/config.json' );
					$theme_config = json_decode( $theme_config, true );

					if ( 'true' === $theme_config['supports-pdf'] ) {

						$valid_themes[ $theme_name_prep ]['path'] = $theme_path;
						$theme_url                                = $this->config->theme_packs_url . $theme_name;
						$valid_themes[ $theme_name_prep ]['url']  = $theme_url;
						$valid_themes[ $theme_name_prep ]['name'] = $theme_config['name'];

						if ( file_exists( $theme_path . '/preview.jpg' ) ) {

							$valid_themes[ $theme_name_prep ]['preview'] = $theme_url . '/preview.jpg';

						} else {

							$valid_themes[ $theme_name_prep ]['preview'] = $this->config->event_plugin_url . 'images/no-preview.jpg';

						}

						$valid_themes[ $theme_name_prep ]['file_name'] = $file->getFilename();

					}
				}
			}
		}

		return $valid_themes;
	}

	/**
	 * Checks if FooEvents is installed
	 */
	public function check_fooevents() {

		if ( ! function_exists( 'is_plugin_active' ) || ! function_exists( 'is_plugin_active_for_network' ) ) {

			require_once ABSPATH . '/wp-admin/includes/plugin.php';

		}

		if ( ! is_plugin_active( 'fooevents/fooevents.php' ) ) {

			$this->output_notices( array( __( 'The FooEvents PDF Tickets plugin requires FooEvents for WooCommerce to be installed.', 'fooevents-pdf-tickets' ) ) );

		}
	}

	/**
	 * Checks if GD libraries is enabled
	 */
	public function check_gd() {

		if ( ! extension_loaded( 'gd' ) ) {

			$this->output_notices( array( __( 'GD libraries is not enabled on your server. This is a requirement for FooEvents PDF tickets. Please contact your host to enable this.', 'fooevents-pdf-tickets' ) ) );

		}

		if ( ! ini_get( 'allow_url_fopen' ) ) {

			$this->output_notices( array( __( 'The setting allow_url_fopen is not enabled on your server. This is a requirement for FooEvents PDF tickets. Please contact your host to enable this.', 'fooevents-pdf-tickets' ) ) );

		}

		if ( ! extension_loaded( 'mbstring' ) ) {

			$this->output_notices( array( __( 'The PHP MBstring module is not enabled on your server. This is a requirement for FooEvents PDF tickets. Please contact your host to enable this.', 'fooevents-pdf-tickets' ) ) );

		}
	}

	/**
	 * Initializes plugin
	 */
	public function plugin_init() {

		// Main config.
		$this->config = new FooEvents_PDF_Tickets_Config();

		// PDFHelper.
		require_once $this->config->class_path . 'class-fooevents-pdf-helper.php';
		$this->pdf_helper = new FooEvents_PDF_Helper( $this->config );

		// UpdateHelper.
		require_once $this->config->class_path . 'updatehelper.php';
		$this->update_helper = new FooEvents_PDF_Tickets_Update_Helper( $this->config );
	}

	/**
	 * Initializes the WooCommerce meta box
	 */
	public function add_product_pdf_tickets_options_tab() {

		echo '<li class="custom_tab_pdf_tickets"><a href="#fooevents_pdf_ticket_settings">' . esc_attr__( ' PDF Tickets', 'fooevents-pdf-tickets' ) . '</a></li>';
	}

	/**
	 * Add options
	 *
	 * @param object $post post.
	 */
	public function add_product_pdf_tickets_options_tab_options( $post ) {

		$fooevents_pdf_tickets_email_text = get_post_meta( $post->ID, 'FooEventsPDFTicketsEmailText', true );
		$fooevents_ticket_footer_text     = get_post_meta( $post->ID, 'FooEventsTicketFooterText', true );

		ob_start();

		require $this->config->template_path . 'product-pdf-ticket-options.php';

		$pdf_ticket_options = ob_get_clean();

		return $pdf_ticket_options;
	}

	/**
	 * Adds the WooCommerce tab settings
	 */
	public function add_settings_tab_settings() {

		woocommerce_admin_fields( $this->get_tab_settings() );
	}

	/**
	 * Saves the WooCommerce tab settings
	 */
	public function update_settings_tab_settings() {

		woocommerce_update_options( $this->get_tab_settings() );
	}

	/**
	 * Builds a ticket per page pdf
	 *
	 * @param int    $product_id product ID.
	 * @param array  $tickets tickets to generate.
	 * @param string $event_plugin_url main plugin URL.
	 * @param string $event_plugin_path main plugin path.
	 */
	public function generate_ticket( $product_id, $tickets, $event_plugin_url, $event_plugin_path, $merge_fields_global = array() ) {

		$woocommerce_events_pdf_ticket_theme = get_post_meta( $product_id, 'WooCommerceEventsPDFTicketTheme', true );

		$ticket_output = '';
		$file_name     = '';
		$num_tickets   = count( $tickets );
		$x             = 1;

		$ticket_output .= $this->pdf_helper->parse_email_template( $woocommerce_events_pdf_ticket_theme . '/header.php', $tickets[0], array() );

		foreach ( $tickets as $ticket ) {

			$ticket['ticketNumber'] = $x;
			$ticket['type']         = 'PDF';
			$ticket['ticketTotal']  = $num_tickets;

			if ( empty( $merge_fields_global ) ) {

				$order = array();
				try {

					$order = new WC_Order( $ticket['WooCommerceEventsOrderID'] );

				} catch ( Exception $e ) {

					// Do nothing for now.

				}

				$merge_fields_global = array(
					'{OrderNumber}'       => '[#' . $ticket['WooCommerceEventsOrderID'] . ']',
					'{EventName}'         => get_the_title( $ticket['WooCommerceEventsProductID'] ),
					'{EventVenue}'        => $ticket['WooCommerceEventsLocation'],
					'{EventDate}'         => $ticket['WooCommerceEventsDate'],
					'{CustomerFirstName}' => $order->get_billing_first_name(),
					'{CustomerLastName}'  => $order->get_billing_last_name(),
					'{AttendeeFName}'     => $ticket['WooCommerceEventsAttendeeName'],
					'{AttendeeLName}'     => $ticket['WooCommerceEventsAttendeeLastName'],
					'{TicketID}'          => $ticket['WooCommerceEventsTicketID'],
				);

			}

			$merge_fields_global['{AttendeeFName}'] = $ticket['WooCommerceEventsAttendeeName'];
			$merge_fields_global['{AttendeeLName}'] = $ticket['WooCommerceEventsAttendeeLastName'];
			$merge_fields_global['{TicketID}']      = $ticket['WooCommerceEventsTicketID'];

			$parsed_ticket  = $this->pdf_helper->parse_ticket_template( $ticket, $woocommerce_events_pdf_ticket_theme . '/ticket.php' );
			$parsed_ticket  = strtr( $parsed_ticket, $merge_fields_global );
			$ticket_output .= $parsed_ticket;

			if ( 1 === $x ) {

				$file_name .= $ticket['barcodeFileName'];

			}

			if ( $x === $num_tickets ) {

				$file_name .= '-' . $ticket['barcodeFileName'];

			} else {

				++$x;

			}
		}
		$tickets[0]['type']         = 'PDF';
		$tickets[0]['ticketNumber'] = $x;
		$ticket_output             .= $this->pdf_helper->parse_email_template( $woocommerce_events_pdf_ticket_theme . '/footer.php', $tickets[0], array() );

		$global_fooevents_pdf_tickets_arabic_support = get_option( 'globalFooEventsPDFTicketsArabicSupport' );
		if ( 'yes' === $global_fooevents_pdf_tickets_arabic_support ) {

			if ( ! function_exists( 'is_plugin_active' ) || ! function_exists( 'is_plugin_active_for_network' ) ) {

				require_once ABSPATH . '/wp-admin/includes/plugin.php';

			}

			$ar_php = '';
			if ( is_plugin_active( 'fooevents_pdf_tickets_extended/fooevents-pdf-tickets-extended.php' ) || is_plugin_active_for_network( 'fooevents_pdf_tickets_extended/fooevents-pdf-tickets-extended.php' ) ) {

				$FooEvents_PDF_Tickets_Extended = new FooEvents_PDF_Tickets_Extended();

				$ar_php = $FooEvents_PDF_Tickets_Extended->get_ar_php_object();

			}

			if ( ! empty( $ar_php ) ) {

				$p = $ar_php->arIdentify( $ticket_output );
				for ( $i = count( $p ) - 1; $i >= 0; $i -= 2 ) {

					$utf8ar        = $ar_php->utf8Glyphs( substr( $ticket_output, $p[ $i - 1 ], $p[ $i ] - $p[ $i - 1 ] ) );
					$ticket_output = substr_replace( $ticket_output, $utf8ar, $p[ $i - 1 ], $p[ $i ] - $p[ $i - 1 ] );

				}
			}
		}

		$global_fooevents_pdf_tickets_font = get_option( 'globalFooEventsPDFTicketsFont' );

		$dompdf = new Dompdf();
		$dompdf->loadHtml( $ticket_output );
		$dompdf->setBasePath( ABSPATH );
		$dompdf->set_option( 'enable_remote', true );
		$dompdf->setPaper( 'A4' );

		if ( 'Noto Sans JP' == $global_fooevents_pdf_tickets_font ) {
			$dompdf->getOptions()->setIsFontSubsettingEnabled( false );
		} else {

			$dompdf->getOptions()->setIsFontSubsettingEnabled( true );
		}

		$dompdf->render();

		$output = $dompdf->output();
		$path   = $this->config->pdf_ticket_path . '' . $file_name . '.pdf';
		file_put_contents( $path, $output );

		return $path;
	}

	/**
	 * Build multiple tickets per page pdf
	 *
	 * @param array  $tickets tickets.
	 * @param string $event_plugin_url event plugin url.
	 * @param string $event_plugin_path event plugin path.
	 */
	public function generate_multiple_ticket( $tickets, $event_plugin_url, $event_plugin_path ) {

		$ticket_output  = '';
		$file_name      = '';
		$x              = 1;
		$num_tickets    = count( $tickets );
		$sorted_tickets = array();

		foreach ( $tickets as $ticket ) {

			$sorted_tickets[ $ticket['name'] ][] = $ticket;

		}

		foreach ( $tickets as $ticket ) {

			if ( 1 === $x ) {

				$file_name .= $ticket['barcodeFileName'];

			}

			if ( $x === $num_tickets ) {

				$file_name .= '-' . $ticket['barcodeFileName'];

			}

			++$x;

		}

		foreach ( $sorted_tickets as $tickets ) {

			$ticket_output .= $this->pdf_helper->parse_multiple_ticket_template( $tickets, 'pdf-ticket-template-multiple.php', $event_plugin_url, $event_plugin_path );

		}

		$global_fooevents_pdf_tickets_font = get_option( 'globalFooEventsPDFTicketsFont' );

		$dompdf = new Dompdf();
		$dompdf->loadHtml( $ticket_output );
		$dompdf->setBasePath( ABSPATH );
		$dompdf->set_option( 'enable_remote', true );
		$dompdf->setPaper( 'A4' );

		if ( 'Noto Sans JP' == $global_fooevents_pdf_tickets_font ) {
			$dompdf->getOptions()->setIsFontSubsettingEnabled( false );
		} else {

			$dompdf->getOptions()->setIsFontSubsettingEnabled( true );
		}

		$dompdf->render();

		$output = $dompdf->output();
		$path   = $this->config->pdf_ticket_path . '' . $file_name . '.pdf';
		file_put_contents( $path, $output );

		return $path;
	}

	/**
	 * Includes email template and parses PHP.
	 *
	 * @param string $template template.
	 * @return string
	 */
	public function parse_email_template( $template ) {

		ob_start();

		// Check theme directory for template first.
		if ( file_exists( $this->config->template_path_theme . $template ) ) {

			include $this->config->template_path_theme . $template;

		} else {

			include $this->config->template_path . $template;

		}

		return ob_get_clean();
	}

	/**
	 * Display PDF options
	 */
	public function get_pdf_options() {

		ob_start();

		$global_fooevents_pdf_tickets_enable             = get_option( 'globalFooEventsPDFTicketsEnable' );
		$global_fooevents_pdf_tickets_downloads          = get_option( 'globalFooEventsPDFTicketsDownloads' );
		$global_fooevents_pdf_tickets_attach_html_ticket = get_option( 'globalFooEventsPDFTicketsAttachHTMLTicket' );
		$global_fooevents_pdf_tickets_arabic_support     = get_option( 'globalFooEventsPDFTicketsArabicSupport' );
		$global_fooevents_pdf_tickets_font               = get_option( 'globalFooEventsPDFTicketsFont' );

		if ( empty( $global_fooevents_pdf_tickets_font ) ) {

			$global_fooevents_pdf_tickets_font = 'DejaVu Sans';

		}

		include $this->config->template_path . '/global-settings-pdf.php';

		return ob_get_clean();
	}

	/**
	 * Register FooEvents PDF Ticket options
	 */
	public function register_settings_options() {

		register_setting( 'fooevents-settings-pdf', 'globalFooEventsPDFTicketsEnable' );
		register_setting( 'fooevents-settings-pdf', 'globalFooEventsPDFTicketsDownloads' );
		register_setting( 'fooevents-settings-pdf', 'globalFooEventsPDFTicketsAttachHTMLTicket' );
		register_setting( 'fooevents-settings-pdf', 'globalFooEventsPDFTicketsArabicSupport' );
		register_setting( 'fooevents-settings-pdf', 'globalFooEventsPDFTicketsFont' );
	}

	/**
	 * Load text domain for translations
	 */
	public function load_text_domain() {

		$path   = dirname( plugin_basename( __FILE__ ) ) . '/languages/';
		$loaded = load_plugin_textdomain( 'fooevents-pdf-tickets', false, $path );
	}

	/**
	 * Add ticket menu item to customer My Account
	 *
	 * @param array $items menu items.
	 */
	public function add_tickets_account_menu_item( $items ) {

		$global_fooevents_pdf_tickets_downloads = get_option( 'globalFooEventsPDFTicketsDownloads' );

		if ( 'yes' === $global_fooevents_pdf_tickets_downloads ) {

			$logout = $items['customer-logout'];
			unset( $items['customer-logout'] );

			$items['fooevents-tickets'] = __( 'Tickets', 'fooevents-pdf-tickets' );
			$items['customer-logout']   = $logout;

		}

		return $items;
	}

	/**
	 * Helper function to display tickets in customer My Account
	 */
	public function fooevents_endpoints() {

		add_rewrite_endpoint( 'fooevents-tickets', EP_ROOT | EP_PAGES );
	}

	/**
	 * Helper function to display tickets in customer My Account
	 *
	 * @param array $vars vars.
	 */
	public function fooevents_query_vars( $vars ) {

		$vars[] = 'fooevents-tickets';

		return $vars;
	}

	/**
	 * Helper function to display tickets in customer My Account
	 */
	public function fooevents_flush_rewrite_rules() {

		flush_rewrite_rules();
	}

	/**
	 * Display customer tickets in My Account
	 */
	public function fooevents_custom_endpoint_content() {

		$user = wp_get_current_user();

		$tickets = new WP_Query(
			array(
				'post_type'      => array( 'event_magic_tickets' ),
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'key'   => 'WooCommerceEventsCustomerID',
						'value' => $user->ID,
					),
				),
			)
		);
		$tickets = $tickets->get_posts();

		// generate tickets if no exists.
		foreach ( $tickets as $ticket ) {

			$woocommerce_events_ticket_id   = get_post_meta( $ticket->ID, 'WooCommerceEventsTicketID', true );
			$woocommerce_events_ticket_hash = get_post_meta( $ticket->ID, 'WooCommerceEventsTicketHash', true );
			$woocommerce_events_product_id  = get_post_meta( $ticket->ID, 'WooCommerceEventsProductID', true );

			$file_name = '';
			if ( ! empty( $woocommerce_events_ticket_hash ) ) {

				$file_name = $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id;

			} else {

				$file_name = $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_id;

			}

			$path = $this->config->pdf_ticket_path . '' . $file_name . '.pdf';

			if ( ! file_exists( $path ) ) {

				$ticket_gen = array();
				$fooevents  = new FooEvents();

				$ticket_data  = $fooevents->get_ticket_data( $ticket->ID );
				$ticket_gen[] = $ticket_data;

				$event_plugin_path         = $fooevents->get_plugin_path();
				$event_plugin_url          = $fooevents->get_plugin_url();
				$event_plugin_barcode_path = $fooevents->get_barcode_path();

				$this->generate_ticket( $woocommerce_events_product_id, $ticket_gen, $event_plugin_barcode_path, $event_plugin_path );

			}
		}

		if ( file_exists( $this->config->template_path_theme . 'my_account_ticket_list.php' ) ) {

			include $this->config->template_path_theme . 'my_account_ticket_list.php';

		} elseif ( file_exists( $this->config->template_path_theme . 'my-account-ticket-list.php' ) ) {

			include $this->config->template_path_theme . 'my-account-ticket-list.php';

		} else {

			include $this->config->template_path . 'my-account-ticket-list.php';

		}
	}

	/**
	 * Displays ticket download on Edit Ticket page
	 *
	 * @param int    $post_ID post ID.
	 * @param string $event_barcode_path barcode path.
	 * @param string $event_plugin_url plugin URL.
	 */
	public function display_ticket_download( $post_ID, $event_barcode_path, $event_plugin_url ) {

		$woocommerce_events_ticket_id   = get_post_meta( $post_ID, 'WooCommerceEventsTicketID', true );
		$woocommerce_events_ticket_hash = get_post_meta( $post_ID, 'WooCommerceEventsTicketHash', true );
		$woocommerce_events_product_id  = get_post_meta( $post_ID, 'WooCommerceEventsProductID', true );

		$file_name = '';
		if ( ! empty( $woocommerce_events_ticket_hash ) ) {

			$file_name = $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id;

		} else {

			$file_name = $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_id;

		}

		$url_path  = $this->config->pdf_ticket_url . $file_name . '.pdf';
		$file_path = $this->config->pdf_ticket_path . $file_name . '.pdf';

		if ( ! file_exists( $file_path ) ) {

			$ticket      = array();
			$fooevents   = new FooEvents();
			$ticket_data = $fooevents->get_ticket_data( $post_ID );
			$ticket[]    = $ticket_data;

			$this->generate_ticket( $woocommerce_events_product_id, $ticket, $event_barcode_path, $event_plugin_url );

		}
		ob_start();

		include $this->config->path . 'templates/tickets-edit-ticket-pdf-link.php';

		$pdf_ticket_link = ob_get_clean();

		return $pdf_ticket_link;
	}

	/**
	 * Function to move templates to new location in uploads directory
	 *
	 * @param string $source source.
	 * @param string $dest destination.
	 * @param int    $permissions file permissions.
	 */
	private function xcopy( $source, $dest, $permissions = 0755 ) {
		if ( is_link( $source ) ) {

			return symlink( readlink( $source ), $dest );

		}

		if ( is_file( $source ) ) {

			return copy( $source, $dest );

		}

		if ( ! is_dir( $dest ) ) {

			mkdir( $dest, $permissions );

		}

		$dir = dir( $source );
		while ( false !== $entry = $dir->read() ) {

			if ( '.' === $entry || '..' === $entry ) {
				continue;
			}

			$this->xcopy( "$source/$entry", "$dest/$entry", $permissions );
		}

		$dir->close();
		return true;
	}

	/**
	 * Outputs notices to screen.
	 *
	 * @param array $notices notices.
	 */
	private function output_notices( $notices ) {

		foreach ( $notices as $notice ) {

				echo '<div class="updated"><p>' . esc_attr( $notice ) . '</p></div>';

		}
	}
}

/**
 * Deletes PDF ticket options when uninstall plugin
 */
function uninstall_fooevents_pdf_tickets() {

	delete_option( 'globalFooEventsPDFTicketsEnable' );
	delete_option( 'globalFooEventsPDFTicketsDownloads' );
	delete_option( 'globalFooEventsPDFTicketsAttachHTMLTicket' );
	delete_option( 'globalFooEventsPDFTicketsArabicSupport' );
	delete_option( 'globalFooEventsPDFTicketsFont' );
	delete_option( 'globalFooEventsPDFTicketsLayout' );
}

register_uninstall_hook( __FILE__, 'uninstall_fooevents_pdf_tickets' );
