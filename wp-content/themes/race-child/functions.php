<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;


add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );
         
if ( !function_exists( 'child_theme_configurator_css' ) ):
    function child_theme_configurator_css() {
        wp_enqueue_style( 'chld_thm_cfg_child', trailingslashit( get_stylesheet_directory_uri() ) . 'style.css', array( 'thewebs-global','thewebs-header','thewebs-content','thewebs-footer' ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'child_theme_configurator_css', 10 );


		/* 1) Return the modal HTML for a given product */
		add_action('wp_ajax_sl_merch_modal',        'sl_merch_modal_html');
		add_action('wp_ajax_nopriv_sl_merch_modal', 'sl_merch_modal_html');
		function sl_merch_modal_html() {
			check_ajax_referer('sl_merch', 'nonce');

			$pid = isset($_GET['product_id']) ? absint($_GET['product_id']) : 0;
			if (!$pid) wp_send_json_error(['message' => 'Missing product_id']);

			$product = wc_get_product($pid);
			if (!$product) wp_send_json_error(['message' => 'Invalid product.']);

			// Make Woo templates see this product context
			$GLOBALS['product'] = $product;
			$GLOBALS['post']    = get_post($pid);
			if ($GLOBALS['post']) setup_postdata($GLOBALS['post']);

			ob_start(); ?>
			<button class="sl-modal__close" type="button" aria-label="<?php esc_attr_e('Close','woocommerce'); ?>">&times;</button>
			<h3 class="sl-modal__title"><?php echo esc_html($product->get_name()); ?></h3>
			<?php echo $product->get_image('woocommerce_thumbnail', ['class' => 'sl-modal__img']); ?>

			<?php if ( $product->is_type('variable') ) : ?>

				<?php
				// OUTPUT ONLY Woo's variable add-to-cart template (it includes its own <form>)
				wc_get_template(
					'single-product/add-to-cart/variable.php',
					[
						'available_variations' => $product->get_available_variations(),
						'attributes'           => $product->get_variation_attributes(),
						'selected_attributes'  => $product->get_default_attributes(),
					]
				);
				?>

			<?php else : ?>

		<form class="cart sl-add-form" method="post">
		  <?php if ( $product->is_type('variable') ) : ?>

			<?php
			// Let Woo's template render its own quantity & button
			wc_get_template(
			  'single-product/add-to-cart/variable.php',
			  array(
				'available_variations' => $product->get_available_variations(),
				'attributes'           => $product->get_variation_attributes(),
				'selected_attributes'  => $product->get_default_attributes(),
			  )
			);
			?>

		  <?php else : ?>

			<div class="quantity">
			  <?php woocommerce_quantity_input( array( 'input_value' => 1 ), $product, false ); ?>
			</div>
			<input type="hidden" name="add-to-cart" value="<?php echo esc_attr( $pid ); ?>">
			<button type="submit" class="button alt sl-add-submit">
			  <?php esc_html_e( 'Add to order', 'woocommerce' ); ?>
			</button>

		  <?php endif; ?>
		</form>
			<?php endif; ?>

			<?php
			$html = ob_get_clean();
			if (isset($GLOBALS['post'])) wp_reset_postdata();
			wp_send_json_success(['html' => $html]);
		}


/* 2) Add the selected merch to cart and return refreshed fragments */
add_action('wp_ajax_sl_merch_add_to_cart',        'sl_merch_add_to_cart');
add_action('wp_ajax_nopriv_sl_merch_add_to_cart', 'sl_merch_add_to_cart');
function sl_merch_add_to_cart() {
    check_ajax_referer('sl_merch', 'nonce');

    $product_id   = isset($_POST['add-to-cart']) ? absint($_POST['add-to-cart']) : 0;
    $quantity     = isset($_POST['quantity']) ? wc_stock_amount(wp_unslash($_POST['quantity'])) : 1;
    $variation_id = isset($_POST['variation_id']) ? absint($_POST['variation_id']) : 0;
    $variation    = [];

    if (!$product_id) {
        wp_send_json_error(['message' => __('Invalid product.', 'woocommerce')]);
    }

    $product = wc_get_product($product_id);

    // Collect chosen variation attributes when applicable
    if ($product && $product->is_type('variable') && $variation_id) {
        foreach ($product->get_variation_attributes() as $attr_name => $options) {
            $key = 'attribute_' . sanitize_title($attr_name);
            if (isset($_POST[$key])) {
                $variation[$key] = wc_clean(wp_unslash($_POST[$key]));
            }
        }
    }

    $added_key = WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation);
    if ($added_key) {
        // Sends updated mini-cart / totals and exits.
        WC_AJAX::get_refreshed_fragments();
    }

    wp_send_json_error(['message' => __('Could not add item.', 'woocommerce')]);
}

// END ENQUEUE PARENT ACTION

// SVG upload
function add_file_types_to_uploads($file_types){
    $new_filetypes = array();
    $new_filetypes['svg'] = 'image/svg+xml';
    $file_types = array_merge($file_types, $new_filetypes );
    return $file_types;
}
add_filter('upload_mimes', 'add_file_types_to_uploads');

// Load the `custom-theme` functions.
require get_stylesheet_directory() . '/inc/default-setting.php';


// Enhance WooCommerce search to include custom fields (e.g., attributes, date, location)
function custom_search_join( $join ) {
    global $wpdb;
    if ( is_search() && ! is_admin() ) {
        $join .= " LEFT JOIN {$wpdb->postmeta} ON {$wpdb->posts}.ID = {$wpdb->postmeta}.post_id";
    }
    return $join;
}
add_filter( 'posts_join', 'custom_search_join' );

function custom_search_where( $where ) {
    global $wpdb;
    if ( is_search() && ! is_admin() ) {
        $where = preg_replace(
            "/\(\s*{$wpdb->posts}.post_title\s+LIKE\s*(\'[^\']+\')\s*\)/",
            "({$wpdb->posts}.post_title LIKE $1) OR ({$wpdb->postmeta}.meta_value LIKE $1)",
            $where
        );
    }
    return $where;
}
add_filter( 'posts_where', 'custom_search_where' );

function custom_search_distinct( $where ) {
    if ( is_search() && ! is_admin() ) {
        return "DISTINCT";
    }
    return $where;
}
add_filter( 'posts_distinct', 'custom_search_distinct' );

/**
 * Permanently hide the "Merchandise" category from WooCommerce catalog views:
 * - Shop page
 * - Product category/tag archives
 * - Product search results
 * Also hide the category in widgets, dropdowns, and subcategory tiles.
 */
add_action('init', function () {

    // 1) Set the slugs you want to exclude
    $excluded_slugs = array('merchandise'); // <-- keep unique; add more if needed

    // Resolve slugs -> term IDs (skip non-existent)
    $excluded_terms = array();
    foreach ($excluded_slugs as $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term && !is_wp_error($term)) {
            $excluded_terms[] = (int) $term->term_id;
        }
    }
    if (empty($excluded_terms)) {
        return; // nothing to do
    }

    // === A) Exclude products in these categories from ALL catalog contexts ===
    add_action('pre_get_posts', function($q) use ($excluded_slugs) {
        if (is_admin() || !$q->is_main_query()) return;

        $is_wc_catalog =
            (function_exists('is_shop') && is_shop()) ||
            (function_exists('is_product_category') && is_product_category()) ||
            (function_exists('is_product_tag') && is_product_tag()) ||
            (function_exists('is_post_type_archive') && is_post_type_archive('product')) ||
            (is_search() && (
                $q->get('post_type') === 'product' ||
                (is_array($q->get('post_type')) && in_array('product', (array)$q->get('post_type'), true))
            ));

        if (!$is_wc_catalog) return;

        // Add a NOT IN tax_query for the excluded slugs
        $tax_query   = (array) $q->get('tax_query');
        $tax_query[] = array(
            'taxonomy'         => 'product_cat',
            'field'            => 'slug',
            'terms'            => $excluded_slugs,
            'operator'         => 'NOT IN',
            'include_children' => false, // set true if you also want to hide children
        );
        $q->set('tax_query', $tax_query);
    });

    // === B) Exclude categories from WooCommerce category widgets (lists) ===
    add_filter('woocommerce_product_categories_widget_args', function($args) use ($excluded_terms) {
        $existing       = isset($args['exclude']) ? (array) $args['exclude'] : array();
        $args['exclude'] = array_unique(array_merge($existing, $excluded_terms));
        return $args;
    });

    // === C) Exclude categories from WooCommerce category dropdowns ===
    add_filter('woocommerce_product_categories_widget_dropdown_args', function($args) use ($excluded_terms) {
        $existing       = isset($args['exclude']) ? (array) $args['exclude'] : array();
        $args['exclude'] = array_unique(array_merge($existing, $excluded_terms));
        return $args;
    });

    // === D) Exclude categories from the subcategory tiles shown on the Shop page ===
    add_filter('woocommerce_product_subcategories_args', function($args) use ($excluded_terms) {
        $existing       = isset($args['exclude']) ? (array) $args['exclude'] : array();
        $args['exclude'] = array_unique(array_merge($existing, $excluded_terms));
        return $args;
    });

    // OPTIONAL: If you also want to block direct access to the category archive URL(s),
    // uncomment the block below to 404 those term archives.
    /*
    add_action('template_redirect', function() use ($excluded_terms) {
        if (function_exists('is_product_category') && is_product_category()) {
            $obj = get_queried_object();
            if ($obj && isset($obj->term_id) && in_array((int)$obj->term_id, $excluded_terms, true)) {
                global $wp_query;
                $wp_query->set_404();
                status_header(404);
                nocache_headers();
                include get_query_template('404');
                exit;
            }
        }
    });
    */
});
/* === FooEvents calendar tooltip: container + patch + behaviour ===
   Paste this once at the end of race-child/functions.php. */

/* 0) Tooltip container (printed once; safe if theme lacks wp_body_open) */
if ( ! function_exists( 'sl_render_foop_calendar_tip_markup' ) ) {
    function sl_render_foop_calendar_tip_markup() {
        return '<div id="foop-cal-tip" aria-hidden="true"></div>';
    }
}
if ( ! function_exists( 'sl_output_foop_calendar_tip_once' ) ) {
    function sl_output_foop_calendar_tip_once() {
        static $printed = false;
        if ( $printed || is_admin() ) return;
        $printed = true;
        echo sl_render_foop_calendar_tip_markup();
    }
    add_action( 'wp_body_open', 'sl_output_foop_calendar_tip_once', 1 );
    add_action( 'wp_footer',     'sl_output_foop_calendar_tip_once', 999 );
}
add_shortcode( 'foop_cal_tip', function () { return sl_render_foop_calendar_tip_markup(); } );

/* 0.1) Minimal styles (move to your CSS later if you like) */
add_action( 'wp_enqueue_scripts', function () {
    if ( is_admin() ) return;
    $css = '
        #foop-cal-tip{
            position:fixed; z-index:9999; display:none; pointer-events:none; max-width:280px;
            background:#fff; color:#1f2937; border:1px solid #e5e7eb; border-radius:10px;
            box-shadow:0 10px 25px rgba(0,0,0,.12); padding:12px 14px;
            font:500 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        }
        #foop-cal-tip .tip-title{ font-weight:700; margin-bottom:4px; }
        #foop-cal-tip .tip-meta { font-size:12px; color:#6b7280; margin-top:6px; }
    ';
    wp_register_style( 'sl-foop-tip-inline', false );
    wp_enqueue_style( 'sl-foop-tip-inline' );
    wp_add_inline_style( 'sl-foop-tip-inline', $css );
}, 20 );

/* 1) Patch FullCalendar to stamp data-city / data-category on each .fc-event
      (handles both eventRender and eventAfterRender). Runs before FooEvents init. */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;

    $patch = <<<JS
    (function($){
        if (!$.fn || !$.fn.fullCalendar) return;

        var _init = $.fn.fullCalendar;
        $.fn.fullCalendar = function(options){
            if (typeof options === 'object' && options) {
                function stamp(el, ev){
                    if (!el) return;
                    var \$el = $(el);
                    if (ev && ev.city)     { \$el.attr('data-city', ev.city); }
                    if (ev && ev.category) { \$el.attr('data-category', ev.category); }
                }
                var origER = options.eventRender;
                var origAR = options.eventAfterRender;

                options.eventRender = function(event, element, view){
                    if (typeof origER === 'function') { origER.call(this, event, element, view); }
                    stamp(element, event);
                };
                options.eventAfterRender = function(event, element, view){
                    if (typeof origAR === 'function') { origAR.call(this, event, element, view); }
                    stamp(element, event);
                };
            }
            return _init.apply(this, arguments);
        };
    })(jQuery);
    JS;

    wp_add_inline_script('jquery', $patch); // prints early with jQuery
}, 1);

/* 2) Tooltip behaviour (footer) */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;

    $tooltip = <<<JS
    (function($){
        var \$tip = $('#foop-cal-tip');
        if (!\$tip.length) return;

        function positionTip(e){
            var mx = (e.clientX||0) + 16, my = (e.clientY||0) + 16;
            var w = \$tip.outerWidth(), h = \$tip.outerHeight();
            var vw = window.innerWidth, vh = window.innerHeight;
            if (mx + w + 20 > vw) mx = vw - w - 20;
            if (my + h + 20 > vh) my = vh - h - 20;
            \$tip.css({left: mx+'px', top: my+'px'});
        }
        function showTip(e, html){ \$tip.html(html).attr('aria-hidden','false').css({display:'block'}); positionTip(e); }
        function hideTip(){ \$tip.attr('aria-hidden','true').hide().empty(); }

        $(document)
          .on('mouseenter', '.fc-event', function(e){
              var \$el  = $(this);
              var title = $.trim(\$el.find('.fc-title').text()) || \$el.attr('title') || 'Event';
              var time  = $.trim(\$el.find('.fc-time').text());
              var city  = \$el.attr('data-city') || '';       // set by patch above
              var cat   = \$el.attr('data-category') || '';   // set by patch above
              var html = '<div class="tip-title">'+title+'</div>'
                       + (cat  ? '<div class="tip-meta">'+cat+'</div>'  : '')
                       + (city ? '<div class="tip-meta">'+city+'</div>' : '')
                       + (time ? '<div class="tip-meta">'+time+'</div>' : '');
              showTip(e, html);
          })
          .on('mousemove', '.fc-event', positionTip)
          .on('mouseleave click', '.fc-event', hideTip);
    })(jQuery);
    JS;

    wp_register_script('sl-foop-tip-inline', false, array('jquery'), null, true);
    wp_enqueue_script('sl-foop-tip-inline');
    wp_add_inline_script('sl-foop-tip-inline', $tooltip);
}, 30);

	// Print the empty merch modal container on checkout
	add_action('wp_footer', function () {
		if ( ! is_checkout() ) return; ?>
		<div class="sl-modal" id="sl-merch-modal" aria-hidden="true">
			<div class="sl-modal__backdrop"></div>
			<div class="sl-modal__box" role="dialog" aria-modal="true"></div>
		</div>
	<?php }, 9999);


	// === SL merch modal assets (checkout only) ===
	add_action('wp_enqueue_scripts', function () {
		if (is_checkout()) {
			// Woo’s variation logic for variable products
			wp_enqueue_script('wc-add-to-cart-variation');
			// Our JS (path auto-detects whether theme or plugin)
			$base = trailingslashit(get_stylesheet_directory_uri());
			$file = '/sl-merch-modal.js';
			if (file_exists(WP_CONTENT_DIR . '/plugins/starting-line-organiser-portal/sl-merch-modal.js')) {
				$base = plugins_url('', __FILE__); // plugin folder URL
				$file = '/sl-merch-modal.js';
			}
			wp_enqueue_script(
				'sl-merch-modal',
				$base . $file,
				array('jquery', 'wc-add-to-cart-variation', 'wc-checkout'),
				'1.0',
				true
			);
			wp_localize_script('sl-merch-modal', 'SL_MERCH', array(
				'ajax'  => admin_url('admin-ajax.php'),
				'nonce' => wp_create_nonce('sl_merch'),
			));

				// Tiny CSS for the modal
				$css = '
				.sl-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:99999}
				.sl-modal.open{display:flex}
				.sl-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4)}
				.sl-modal__box{position:relative;background:#fff;border-radius:12px;max-width:720px;width:92%;padding:20px;box-shadow:0 10px 35px rgba(0,0,0,.25);max-height:85vh;overflow:auto}
				.sl-modal__close{position:absolute;top:8px;right:10px;border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer}
				.sl-modal__title{margin:0 0 .5rem}
				.sl-modal__img{max-width:130px;border-radius:8px;margin:.25rem 0 .75rem}
				.sl-modal .button.alt{margin-top:.5rem}

				/* Keep scrolling smooth and make action area easy to see */
				.sl-modal__box{scroll-behavior:smooth}

				/* Dock Woo’s action area at the bottom of the scrollable modal content */
				.sl-modal__box .single_variation_wrap{
				  position:sticky;
				  bottom:0;
				  background:#fff;
				  padding:8px 10px;
				  margin-top:8px;
				  border-top:1px solid #eee;
				}

				/* Make the button obvious and full-width inside the modal on narrow widths */
				.sl-modal__box .single_add_to_cart_button{width:100%}

				/* Lay out qty + button nicely */
				#sl-merch-modal .woocommerce-variation-add-to-cart{
				  display:flex;
				  align-items:center;
				  gap:10px;
				  padding-top:12px;
				  margin-top:10px;
				  border-top:1px solid #eee;
				}

				/* Force the Woo button to be visible inside the modal */
				#sl-merch-modal .single_add_to_cart_button{display:inline-block!important}

				/* Avoid extra bottom spacing so the button stays in view */
				#sl-merch-modal form.cart{margin-bottom:0}
				';
				add_action('wp_head', function() use ($css) { echo '<style>'.$css.'</style>'; });
		}
	});

/**
 * Shop grid: show City + Province under the title for FooEvents products,
 * and change the button text to “Enter Now”.
 */

/* A) Output City / Province (we saved these in _foop_city / _foop_province) */
add_action('woocommerce_after_shop_loop_item_title', function () {
    global $product;
    if (empty($product)) return;

    $pid = $product->get_id();

    // Only touch FooEvents products
    if (get_post_meta($pid, 'WooCommerceEvents', true) !== 'yes') {
        return;
    }

    $city = trim((string) get_post_meta($pid, '_foop_city', true));
    $prov = trim((string) get_post_meta($pid, '_foop_province', true));

    if ($city || $prov) {
        echo '<div class="sl-event-venue">';
        if ($city) echo '<span class="sl-venue-city">'.esc_html($city).'</span>';
        if ($prov) echo '<span class="sl-venue-province">'.esc_html($prov).'</span>';
        echo '</div>';
    }
}, 6); // run after price but before button (adjust if needed)

/* B) Change add-to-cart text for event products to “Enter Now” */
function sl_event_button_text($text, $product){
    if ($product && get_post_meta($product->get_id(),'WooCommerceEvents', true) === 'yes') {
        return __('Enter Now', 'startingline');
    }
    return $text;
}
add_filter('woocommerce_product_add_to_cart_text',        'sl_event_button_text', 10, 2);
add_filter('woocommerce_product_single_add_to_cart_text', 'sl_event_button_text', 10, 2);

/**
 * ─────────────────────────────────────────────────────────────
 * Shop filters: Category, City, Province  (excludes merchandise)
 * - Renders 3 dropdowns above the products
 * - Filters the main WooCommerce product query
 * - Works on the Shop page (and product category archives)
 * ─────────────────────────────────────────────────────────────
 */

/** A) UI above the product grid */
add_action('woocommerce_before_shop_loop', function () {

    if ( ! ( is_shop() || is_product_taxonomy() ) ) return;

    // current selections
    $sel_cat  = isset($_GET['sl_cat'])  ? sanitize_text_field( wp_unslash($_GET['sl_cat']) )  : '';
    $sel_city = isset($_GET['sl_city']) ? sanitize_text_field( wp_unslash($_GET['sl_city']) ) : '';
    $sel_prov = isset($_GET['sl_prov']) ? sanitize_text_field( wp_unslash($_GET['sl_prov']) ) : '';

    // category dropdown (exclude the "merchandise" category)
    $merch_id = 0;
    if ( $t = get_term_by('slug', 'merchandise', 'product_cat') ) {
        $merch_id = (int) $t->term_id;
    }

    // Build category select HTML
    $cat_select = wp_dropdown_categories( array(
        'taxonomy'         => 'product_cat',
        'hide_empty'       => true,
        'show_option_all'  => __('All categories', 'startingline'),
        'name'             => 'sl_cat',
        'orderby'          => 'name',
        'hierarchical'     => true,
        'echo'             => 0,
        'value_field'      => 'slug',
        'selected'         => $sel_cat,
        'exclude'          => $merch_id ? array($merch_id) : array(),
    ) );

    // City & Province lists from product meta
    global $wpdb;

    $cities = $wpdb->get_col(
        $wpdb->prepare(
            "SELECT DISTINCT pm.meta_value
             FROM {$wpdb->postmeta} pm
             INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
             WHERE pm.meta_key = %s AND pm.meta_value <> '' AND p.post_type='product' AND p.post_status='publish'
             ORDER BY pm.meta_value ASC",
            '_foop_city'
        )
    );

    $provs = $wpdb->get_col(
        $wpdb->prepare(
            "SELECT DISTINCT pm.meta_value
             FROM {$wpdb->postmeta} pm
             INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
             WHERE pm.meta_key = %s AND pm.meta_value <> '' AND p.post_type='product' AND p.post_status='publish'
             ORDER BY pm.meta_value ASC",
            '_foop_province'
        )
    );

    $shop_url = wc_get_page_permalink( 'shop' );

    ?>
    <form class="sl-shop-filters" action="<?php echo esc_url( $shop_url ); ?>" method="get">
        <div class="sl-filter">
            <label><?php _e('Category', 'startingline'); ?></label>
            <?php echo $cat_select; ?>
        </div>

        <div class="sl-filter">
            <label><?php _e('City', 'startingline'); ?></label>
            <select name="sl_city">
                <option value=""><?php _e('All cities', 'startingline'); ?></option>
                <?php foreach ( (array) $cities as $c ) : ?>
                    <option value="<?php echo esc_attr( $c ); ?>" <?php selected( $sel_city, $c ); ?>>
                        <?php echo esc_html( $c ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="sl-filter">
            <label><?php _e('Province', 'startingline'); ?></label>
            <select name="sl_prov">
                <option value=""><?php _e('All provinces', 'startingline'); ?></option>
                <?php foreach ( (array) $provs as $p ) : ?>
                    <option value="<?php echo esc_attr( $p ); ?>" <?php selected( $sel_prov, $p ); ?>>
                        <?php echo esc_html( $p ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="sl-filter-actions">
            <button type="submit" class="button"><?php _e('Filter', 'startingline'); ?></button>
            <?php if ( $sel_cat || $sel_city || $sel_prov ) : ?>
                <a class="button button-secondary" href="<?php echo esc_url( $shop_url ); ?>">
                    <?php _e('Reset', 'startingline'); ?>
                </a>
            <?php endif; ?>
        </div>
    </form>
    <style>
        /* quick, clean styling (feel free to move to style.css) */
        .sl-shop-filters{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:8px 0 18px}
        .sl-shop-filters .sl-filter{display:flex;flex-direction:column;gap:6px}
        .sl-shop-filters label{font-size:13px;color:#6b7280}
        .sl-shop-filters select{min-width:180px;padding:.45rem .6rem}
        .sl-shop-filters .sl-filter-actions .button{margin-right:8px}
        @media (max-width:640px){
            .sl-shop-filters select{min-width:150px}
        }
    </style>
    <script>
        // auto-submit on change (nice UX)
        (function(){
            var f = document.querySelector('.sl-shop-filters');
            if(!f) return;
            f.addEventListener('change', function(e){
                if(e.target && (e.target.name==='sl_cat' || e.target.name==='sl_city' || e.target.name==='sl_prov')){
                    f.submit();
                }
            });
        })();
    </script>
    <?php
}, 12);


/** B) Modify the catalog query using the selected filters */
add_action('woocommerce_product_query', function( $q ){

    if ( is_admin() ) return;
    if ( ! ( is_shop() || is_product_taxonomy() ) ) return;

    // Always exclude "merchandise" category
    $tax_query = (array) $q->get('tax_query');
    if ( $t = get_term_by('slug', 'merchandise', 'product_cat') ) {
        $tax_query[] = array(
            'taxonomy'         => 'product_cat',
            'field'            => 'slug',
            'terms'            => array('merchandise'),
            'operator'         => 'NOT IN',
            'include_children' => false,
        );
    }

    // Category filter (if chosen)
    if ( ! empty($_GET['sl_cat']) ) {
        $sel_cat = sanitize_text_field( wp_unslash($_GET['sl_cat']) );
        $tax_query[] = array(
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => array( $sel_cat ),
            'operator' => 'IN',
        );
    }
    if ( ! empty( $tax_query ) ) {
        $q->set( 'tax_query', $tax_query );
    }

    // City / Province meta filters
    $meta_query = (array) $q->get('meta_query');

    if ( ! empty($_GET['sl_city']) ) {
        $meta_query[] = array(
            'key'     => '_foop_city',
            'value'   => sanitize_text_field( wp_unslash($_GET['sl_city']) ),
            'compare' => '=',
        );
    }
    if ( ! empty($_GET['sl_prov']) ) {
        $meta_query[] = array(
            'key'     => '_foop_province',
            'value'   => sanitize_text_field( wp_unslash($_GET['sl_prov']) ),
            'compare' => '=',
        );
    }

    if ( ! empty( $meta_query ) ) {
        $q->set( 'meta_query', $meta_query );
    }
}, 10 );
/**
 * Category pill on product cards (shop grid)
 * - prints first non-"Merchandise" category
 * - overlays the product image
 */
add_action( 'woocommerce_before_shop_loop_item_title', function () {
    global $product;
    if ( ! $product ) return;

    $names = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
    if ( is_wp_error( $names ) || empty( $names ) ) return;

    // Filter out "Merchandise"
    $names = array_values( array_filter( $names, function( $n ){ return strtolower( $n ) !== 'merchandise'; } ) );
    if ( empty( $names ) ) return;

    echo '<span class="sl-cat-badge">' . esc_html( $names[0] ) . '</span>';
}, 5 );


/**
 * Starting Line – Event summary on product Description tab
 * - Adds a polished summary block at the top of the Description tab
 * - Keeps existing content (incl. the Google Map)
 * - Removes duplicate Address/Coordinates paragraphs we previously appended
 * - Hides "Additional information", "Reviews", and "Event Details" tabs
 */

/* ---------- Helpers ---------- */

if ( ! function_exists( 'sl_is_event_product' ) ) {
	function sl_is_event_product( $product_id ) {
		$pid = (int) $product_id;
		if ( ! $pid ) return false;
		// FooEvents marks events with any of these metas in practice.
		return (
			get_post_meta( $pid, 'WooCommerceEvents', true ) === 'yes'
			|| get_post_meta( $pid, 'WooCommerceEventsDate', true )
			|| get_post_meta( $pid, 'WooCommerceEventsType', true )
		);
	}
}

if ( ! function_exists( 'sl_event_category_label' ) ) {
	function sl_event_category_label( $product_id ) {
		$terms = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'all' ] );
		if ( is_wp_error( $terms ) || empty( $terms ) ) return '';
		foreach ( $terms as $t ) {
			// Skip a generic merch category if present.
			if ( strtolower( $t->slug ) === 'merchandise' ) continue;
			return $t->name;
		}
		return $terms[0]->name;
	}
}

if ( ! function_exists( 'sl_event_datetime_bits' ) ) {
	function sl_event_datetime_bits( $product_id ) {
		$start_mysql = (string) get_post_meta( $product_id, 'WooCommerceEventsDateMySQLFormat', true );
		$end_mysql   = (string) get_post_meta( $product_id, 'WooCommerceEventsEndDateMySQLFormat', true );
		$hour        = get_post_meta( $product_id, 'WooCommerceEventsHour', true );
		$min         = get_post_meta( $product_id, 'WooCommerceEventsMinutes', true );

		// Fallbacks from human strings
		if ( $start_mysql === '' ) {
			$h = (string) get_post_meta( $product_id, 'WooCommerceEventsDate', true );
			if ( $h !== '' ) $start_mysql = date( 'Y-m-d 00:00:00', strtotime( $h ) );
		}
		if ( $end_mysql === '' ) {
			$h = (string) get_post_meta( $product_id, 'WooCommerceEventsEndDate', true );
			if ( $h !== '' ) $end_mysql = date( 'Y-m-d 23:59:59', strtotime( $h ) );
		}

		$start_ts = $start_mysql ? strtotime( $start_mysql ) : 0;
		$end_ts   = $end_mysql   ? strtotime( $end_mysql )   : 0;

		$start_date = $start_ts ? date_i18n( get_option( 'date_format' ), $start_ts ) : '';
		$end_date   = $end_ts   ? date_i18n( get_option( 'date_format' ), $end_ts )   : '';
		$time       = ( $hour !== '' && $min !== '' ) ? sprintf( '%02d:%02d', (int) $hour, (int) $min ) : '';

		return [ $start_date, $end_date, $time ];
	}
}

/* Format a km value nicely (e.g. "10" -> "10km", "10.50" -> "10.5km") */
if ( ! function_exists( 'sl_fmt_km' ) ) {
	function sl_fmt_km( $n ) {
		if ( $n === '' || $n === null ) return '';
		$val = (float) $n;
		$txt = rtrim( rtrim( number_format( $val, 2, '.', '' ), '0' ), '.' );
		return $txt . 'km';
	}
}

/* Distances rows (Variation column shows "Name – Xkm") */
if ( ! function_exists( 'sl_event_distance_rows' ) ) {
	function sl_event_distance_rows( $product_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) return '';
		$p = wc_get_product( $product_id );
		if ( ! $p || ! $p->is_type( 'variable' ) ) return '';

		$out = '';
		foreach ( $p->get_children() as $vid ) {
			$v = wc_get_product( $vid );
			if ( ! $v ) continue;

			// Prefer our stored clean pieces
			$clean_label = get_post_meta( $vid, '_sl_distance_label', true );
			$km          = get_post_meta( $vid, '_sl_distance_km',   true );

			// Fallbacks from attributes if missing
			if ( $clean_label === '' || $clean_label === null || $km === '' || $km === null ) {
				$atts = $v->get_attributes();
				$raw  = isset( $atts['attribute_distance'] ) ? (string) $atts['attribute_distance'] : ( ( $atts ? (string) reset( $atts ) : '' ) );

				// Try to parse a trailing “10km”
				if ( ( $km === '' || $km === null ) && preg_match( '/([0-9]*\.?[0-9]+)\s*km?/i', $raw, $m ) ) {
					$km = $m[1];
				}
				if ( $clean_label === '' || $clean_label === null ) {
					// Strip trailing “ - 10km”
					$clean_label = trim( preg_replace( '/\s*[-–—]\s*[0-9]*\.?[0-9]+\s*km?$/i', '', $raw ) );
				}
			}
			if ( $clean_label === '' ) $clean_label = '#' . $vid;

			$display_name = $clean_label . ( $km !== '' && $km !== null ? ' – ' . sl_fmt_km( $km ) : '' );

			$price_html = $v->get_price_html();
			$time       = get_post_meta( $vid, '_sl_start_time', true );
			$limit      = ( method_exists( $v, 'managing_stock' ) && $v->managing_stock() )
				? ( $v->get_stock_quantity() !== null ? (int) $v->get_stock_quantity() : '—' )
				: '—';

			$out .= '<tr>'
				  . '<td>' . esc_html( $display_name ) . '</td>'
				  . '<td>' . ( $price_html ?: '—' ) . '</td>'
				  . '<td>' . ( $time ? esc_html( $time ) : '—' ) . '</td>'
				  . '<td>' . esc_html( is_numeric( $limit ) ? (string) $limit : '—' ) . '</td>'
				  . '</tr>';
		}
		return $out;
	}
}

/* Additional info that organisers type in the form (best-effort) */
if ( ! function_exists( 'sl_event_extra_info_html' ) ) {
	function sl_event_extra_info_html( $product_id ) {
		// Try likely meta keys first (if you ever save it to meta)
		$meta_keys = array( '_foop_extra_info', 'foop_extra_info', 'WooCommerceEventsExtraInfo' );
		foreach ( $meta_keys as $mk ) {
			$val = get_post_meta( $product_id, $mk, true );
			if ( ! empty( $val ) ) {
				$val = wp_kses_post( wpautop( $val ) );
				return '<section class="sl-card"><h4>Additional information</h4>' . $val . '</section>';
			}
		}

		// Fallback: pull from post content (that’s where your form writes it),
		// but strip Address/Coordinates lines that we already render above.
		$content = (string) get_post_field( 'post_content', $product_id );
		$content = preg_replace( '~<p>\s*<strong>\s*Address:\s*</strong>.*?</p>~is', '', $content );
		$content = preg_replace( '~<p>\s*<strong>\s*Coordinates:\s*</strong>.*?</p>~is', '', $content );
		$content = trim( $content );

		if ( $content !== '' ) {
			// Keep it tidy—no H2 etc., just the paragraphs/lists.
			return '<section class="sl-card"><h4>Additional information</h4>' . $content . '</section>';
		}
		return '';
	}
}

/* ---------- Build the block we prepend to the Description tab ---------- */

if ( ! function_exists( 'sl_build_event_summary_block' ) ) {
	function sl_build_event_summary_block( $product_id ) {
		list( $start_date, $end_date, $time ) = sl_event_datetime_bits( $product_id );
		$cat   = sl_event_category_label( $product_id );
		$venue = get_post_meta( $product_id, 'WooCommerceEventsLocation', true );

		// Location meta we save in the portal form
		$addr = array_filter( [
			get_post_meta( $product_id, '_foop_addr1', true ),
			get_post_meta( $product_id, '_foop_addr2', true ),
			get_post_meta( $product_id, '_foop_city',  true ),
			get_post_meta( $product_id, '_foop_province', true ),
		] );
		$addr = $addr ? implode( ', ', array_map( 'sanitize_text_field', $addr ) ) : '';

		$coords = get_post_meta( $product_id, 'WooCommerceEventsGoogleCoordinates', true );
		if ( ! $coords ) $coords = get_post_meta( $product_id, 'WooCommerceEventsGPS', true );

		$rows       = sl_event_distance_rows( $product_id );
		$extra_html = sl_event_extra_info_html( $product_id );

		ob_start(); ?>
		<div class="sl-event-summary">
			<section class="sl-card">
				<h4>Basic Event Info</h4>
				<ul class="sl-kv">
					<?php if ( $cat ) : ?><li><span>Category</span><strong><?php echo esc_html( $cat ); ?></strong></li><?php endif; ?>
					<?php if ( $start_date ) : ?><li><span>Start date</span><strong><?php echo esc_html( $start_date ); ?></strong></li><?php endif; ?>
					<?php if ( $end_date && $end_date !== $start_date ) : ?><li><span>End date</span><strong><?php echo esc_html( $end_date ); ?></strong></li><?php endif; ?>
					<?php if ( $time ) : ?><li><span>Start time</span><strong><?php echo esc_html( $time ); ?></strong></li><?php endif; ?>
				</ul>
			</section>

			<?php if ( $rows ) : ?>
			<section class="sl-card">
				<h4>Distances</h4>
				<table class="sl-table">
					<thead><tr><th>Variation</th><th>Price</th><th>Start</th><th>Limit</th></tr></thead>
					<tbody><?php echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></tbody>
				</table>
			</section>
			<?php endif; ?>

			<section class="sl-card">
				<h4>Event Location</h4>
				<?php if ( $venue ) : ?>
					<p class="sl-venue"><?php echo esc_html( $venue ); ?></p>
				<?php endif; ?>
				<?php if ( $addr ) : ?>
					<p class="sl-addr"><?php echo esc_html( $addr ); ?></p>
				<?php endif; ?>
				<?php if ( $coords ) : ?>
					<p class="sl-coords"><small>Coordinates:</small> <code><?php echo esc_html( $coords ); ?></code></p>
				<?php endif; ?>
				<!-- The Google Map that FooEvents outputs in the original content stays below this block -->
			</section>

			<?php
			// Additional info (from meta if available; otherwise from content)
			if ( $extra_html ) {
				echo $extra_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			?>
		</div>
		<?php
		return ob_get_clean();
	}
}

/* ---------- Prepend block + strip duplicate paragraphs ---------- */

add_filter( 'the_content', function( $content ) {
	if ( ! is_product() ) return $content;
	$post = get_post();
	if ( ! $post || $post->post_type !== 'product' ) return $content;
	if ( ! sl_is_event_product( $post->ID ) ) return $content;

	// Remove the two paragraphs we previously appended into the content
	// <p><strong>Address:</strong> ...</p> and <p><strong>Coordinates:</strong> ...</p>
	$clean = preg_replace( '~<p>\s*<strong>\s*Address:\s*</strong>.*?</p>~is', '', $content );
	$clean = preg_replace( '~<p>\s*<strong>\s*Coordinates:\s*</strong>.*?</p>~is', '', $clean );

	$block = sl_build_event_summary_block( $post->ID );

	// Prepend our block; keep the rest (incl. FooEvents Google Map).
	return $block . $clean;
}, 25 );

/* ---------- Hide tabs: Additional info, Reviews, Event Details ---------- */

add_filter( 'woocommerce_product_tabs', function( $tabs ) {
	unset( $tabs['additional_information'], $tabs['reviews'] );
	// Remove any tab whose title is "Event Details" (case-insensitive).
	foreach ( $tabs as $key => $tab ) {
		if ( isset( $tab['title'] ) && stripos( wp_strip_all_tags( $tab['title'] ), 'event details' ) !== false ) {
			unset( $tabs[ $key ] );
		}
	}
	return $tabs;
}, 98 );

add_action('wp_enqueue_scripts', function () {
    if ( ! is_product() ) return;
    wp_register_style('sl-org-badge-inline', false);
    wp_enqueue_style('sl-org-badge-inline');
    wp_add_inline_style('sl-org-badge-inline', '
.woocommerce-product-gallery .sl-org-badge{
  display:flex;align-items:center;gap:12px;
  background:#fff;border:1px solid #e5e7eb;border-radius:12px;
  padding:10px 12px;margin-top:12px;box-shadow:0 1px 0 rgba(0,0,0,.02)
}
.sl-org-avatar{
  width:48px;height:48px;flex:0 0 48px;
  border-radius:10px;object-fit:contain;background:#fff;border:1px solid #edf1f3
}
.sl-org-meta{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.sl-org-by{font-size:.78rem;color:#6b7280;margin-bottom:2px}
.sl-org-name{font-weight:600;font-size:.98rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:640px){
  .sl-org-avatar{width:42px;height:42px;flex-basis:42px}
  .sl-org-badge{padding:9px 11px;gap:10px}
}
');
}, 20);

/* ---------- Remove big "Description" heading ---------- */
add_filter( 'woocommerce_product_description_heading', '__return_empty_string', 99 );

/* ---------- Minimal styles for a neat, mobile-friendly block ---------- */

add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_product() ) return;
    wp_register_style( 'sl-event-desc-inline', false );
    wp_enqueue_style( 'sl-event-desc-inline' );
    $css = '
    .sl-event-summary{margin:0 0 18px}
    .sl-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:0 0 12px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
    .sl-card h4{margin:0 0 .6rem;font-size:1.1rem}
    .sl-kv{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px}
	.sl-kv li{
	  display:grid;
	  grid-template-columns:minmax(140px,220px) 1fr; /* label | value */
	  gap:8px;
	  align-items:center;
	}
    .sl-kv li span{color:#6b7280}
	.sl-kv li strong{
	  font-weight:600;
	  justify-self:start; /* keep value next to label */
	}
    .sl-table{width:100%;border-collapse:collapse}
    .sl-table th,.sl-table td{border:1px solid #eee;padding:8px;text-align:left}
    .sl-venue{font-weight:600;margin:.25rem 0}
    .sl-addr{margin:.15rem 0 .35rem}
    .sl-coords code{background:#f6f7f8;border:1px solid #e5e7eb;border-radius:6px;padding:2px 6px}
    @media(max-width:640px){ .sl-kv{grid-template-columns:1fr} }

    /* Hide the big "Description" heading inside the tab (theme override fallback) */
    .woocommerce-Tabs-panel--description > h2,
    .single-product div.product .woocommerce-tabs .panel.entry-content > h2:first-child{
      display:none !important;
    }
    ';
    wp_add_inline_style( 'sl-event-desc-inline', $css );
}, 20 );

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FooEvents – Temporary Licence per attendee (Checkout)
 * - Inject a Yes/No toggle under each attendee block.
 * - Count YES per event product and add a WooCommerce fee accordingly.
 * - The per-event fee is read from product meta: _sl_temp_license_fee (float).
 * - No products/variations are added; this is a fee-only UX.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* A) Helper: return the temp-licence fee for a given event product (0 if none) */
function sl_temp_lic_fee_for_product( $product_id ) {
    $pid = (int) $product_id;
    if ( ! $pid ) return 0.0;

    // Decide if it's an event product (FooEvents markers)
    $is_event = (
        get_post_meta( $pid, 'WooCommerceEvents',      true ) === 'yes' ||
        get_post_meta( $pid, 'WooCommerceEventsDate',  true ) ||
        get_post_meta( $pid, 'WooCommerceEventsType',  true )
    );
    if ( ! $is_event ) return 0.0;

    $fee = get_post_meta( $pid, '_sl_temp_license_fee', true );
    $fee = $fee !== '' ? (float) wc_format_decimal( $fee ) : 0.0;
    return $fee > 0 ? $fee : 0.0;
}

		/* B) Checkout assets: inject toggles + keep a hidden counts map in sync */
		add_action( 'wp_enqueue_scripts', function () {
			if ( ! function_exists('is_checkout') || ! is_checkout() || is_order_received_page() ) {
				return;
			}

			// Build PID => fee map (parent product ID for variations)
			$map = array();
			if ( function_exists('WC') && WC()->cart ) {
				foreach ( WC()->cart->get_cart() as $line ) {
					$pid = isset($line['product_id']) ? (int) $line['product_id'] : 0; // parent id for variations
					if ( ! $pid ) { continue; }
					$fee = sl_temp_lic_fee_for_product( $pid ); // checks FooEvents markers + _sl_temp_license_fee
					if ( $fee > 0 ) { $map[$pid] = $fee; }
				}
			}

			// Register a shell so optimizers can't strip our inline code
			wp_register_script( 'sl-temp-lic-inline', '', array( 'jquery', 'wc-checkout' ), null, true );
			wp_enqueue_script(  'sl-temp-lic-inline' );

			// Boot data BEFORE the script
			$boot = 'window.SL_TEMP_LIC_FEES = ' . wp_json_encode( $map ) . ';';
			wp_add_inline_script( 'sl-temp-lic-inline', $boot, 'before' );

			// Main behaviour AFTER the script (nowdoc keeps $… intact)
			$js = <<<'JS'
			(function($){
			  console.log('[SL temp] boot map:', window.SL_TEMP_LIC_FEES);

			  function firstPidWithFee(){
				var m = window.SL_TEMP_LIC_FEES || {};
				for (var k in m){ if (Object.prototype.hasOwnProperty.call(m,k)) return String(k); }
				return '';
			  }

			  function scanForPidNear($root){
				var $form = $root.closest('form.checkout');
				if(!$form.length) $form = $('form.checkout');
				var $candidates = $form.find(
				  'input[type=hidden][name*="WooCommerceEventsProductID"],' +
				  'input[type=hidden][name*="ProductID"],' +
				  'input[type=hidden][name*="product_id"],' +
				  'input[type=hidden][name="add-to-cart"]'
				);

				var pid = '';
				$candidates.each(function(){
				  var v = $.trim($(this).val()||'');
				  if (/^\d+$/.test(v) && (window.SL_TEMP_LIC_FEES||{})[v]){
					pid = v; return false;
				  }
				});
				return pid;
			  }

			  function findPid($att){
				var $hid = $att.find(
				  'input[type=hidden][name*="WooCommerceEventsProductID"],' +
				  'input[type=hidden][name*="ProductID"]'
				);
				if ($hid.length){
				  var v1 = $.trim($hid.first().val()||'');
				  if (v1){ return v1; }
				}
				var $up = $att.closest('[id^="fooevents-attendee"], .fooevents-attendee, .fooevents-checkout-attendee, .col-2, #customer_details');
				if ($up.length){
				  $hid = $up.find(
					'input[type=hidden][name*="WooCommerceEventsProductID"],' +
					'input[type=hidden][name*="ProductID"]'
				  );
				  if ($hid.length){
					var v2 = $.trim($hid.first().val()||'');
					if (v2){ return v2; }
				  }
				}
				var v3 = scanForPidNear($att);
				if (v3){ return v3; }
				return firstPidWithFee();
			  }

			  // Robustly extract {cart key, attendee index} from FooEvents input names
			  function extractCartKeyIdx($wrap){
				var hit = null;
				$wrap.find('input,select,textarea').each(function(){
				  var n = this.name || '';
				  // match ...[<32-hex>][...optional bits...][<number>]
				  var m = n.match(/\[([a-f0-9]{32})\](?:\[[^\]]*\])*\[(\d+)\]/i);
				  if (m) { hit = { key: m[1], idx: parseInt(m[2],10) }; return false; }
				});
				return hit; // {key, idx} or null
			  }

				function injectToggles(){
				  var $blocks = $('.fooevents-checkout-attendee-info');

				  $blocks.each(function(){
					var $wrap = $(this);
					if ($wrap.find('[data-sl-temp-lic]').length) return; // already injected

					var pid = findPid($wrap);
					if (!pid || !(window.SL_TEMP_LIC_FEES||{})[pid]) return; // not an event with a temp-fee

					var name = 'sl_tl_' + Math.random().toString(36).slice(2);
					var html =
					  '<div class="sl-temp-lic" data-sl-temp-lic data-pid="'+pid+'">' +
						'<div class="sl-temp-lic__q">Temporary licence needed for this attendee?' +
						  '<span class="sl-temp-lic__hint"> (permanent licence holders choose "No")</span>' +
						'</div>' +
						'<label style="margin-right:10px;"><input type="radio" name="'+name+'" value="no" checked> No</label>' +
						'<label><input type="radio" name="'+name+'" value="yes"> Yes</label>' +
					  '</div>';

					var $tel = $wrap.find('p.form-row[class*="telephone"], .form-row-telephone').last();
					if ($tel.length) { $tel.after(html); } else { $wrap.append(html); }

					// NEW: bind cart key/index and add hidden YES marker (1-based for FooEvents)
					var $block = $wrap.find('[data-sl-temp-lic]').last();
					var bind = extractCartKeyIdx($wrap);
					if (bind){
					  var idx1 = bind.idx + 1; // FooEvents tickets are 1-based
					  $block.attr('data-ck', bind.key).attr('data-idx1', String(idx1));
					  $('<input>', {
						type: 'hidden',
						'data-sl-yes': true,
						name: 'sl_temp_lic['+bind.key+'][]',
						value: String(idx1),
						disabled: true
					  }).appendTo($block);

					  // restore selection after checkout refreshes
					  try {
						var mem = sessionStorage.getItem('sl_temp_lic::'+bind.key+'::'+idx1);
						if (mem === 'yes') {
						  $block.find('input[type=radio][value=yes]').prop('checked', true);
						  $block.find('input[data-sl-yes]').prop('disabled', false);
						}
					  } catch(e){}
					} 
				  }); 
				} 

			  function recomputeCounts(){
				var counts = {}; // pid -> number of YES
				$('[data-sl-temp-lic][data-pid]').each(function(){
				  var pid = $(this).attr('data-pid');
				  var v   = $(this).find('input[type=radio]:checked').val();
				  if (v === 'yes') counts[pid] = (counts[pid]||0) + 1;
				});

				var $holder = $('#sl-temp-lic-hidden');
				if (!$holder.length) $holder = $('<div id="sl-temp-lic-hidden" style="display:none"></div>').appendTo('form.checkout');
				$holder.empty();

				$.each(counts, function(pid, n){
				  $('<input>', {type:'hidden', name:'sl_temp_license_by_product['+pid+']', value:String(n)}).appendTo($holder);
				});

				$(document.body).trigger('update_checkout');
			  }

			  $(document).on('updated_checkout', function(){
				injectToggles();
			  });

			  $(function(){
				injectToggles();
			  });

			  // Toggle both hidden markers and recompute
				$(document).on('change', '[data-sl-temp-lic] input[type=radio]', function(){
				  var $row = $(this).closest('[data-sl-temp-lic]');
				  var v = $row.find('input[type=radio]:checked').val();
				  $row.find('input[data-sl-yes]').prop('disabled', v !== 'yes'); // only post on "Yes"

				  // persist per attendee across refreshes
				  var ck = $row.attr('data-ck'), idx1 = $row.attr('data-idx1');
				  try { sessionStorage.setItem('sl_temp_lic::'+ck+'::'+idx1, v === 'yes' ? 'yes' : 'no'); } catch(e){}

				  recomputeCounts();
				});

			})(jQuery);
			JS;
			wp_add_inline_script( 'sl-temp-lic-inline', $js, 'after' );

			// Minimal CSS (move to style.css later if you prefer)
			$css = '
			  .sl-temp-lic{background:#fff;border:1px dashed #e5e7eb;border-radius:8px;padding:.5rem;margin:.35rem 0 .25rem}
			  .sl-temp-lic__q{font-size:13px;color:#374151;margin-bottom:.25rem}
			  .sl-temp-lic__hint{color:#6b7280}
			';
			wp_register_style( 'sl-temp-lic-inline', false );
			wp_enqueue_style(  'sl-temp-lic-inline' );
			wp_add_inline_style( 'sl-temp-lic-inline', $css );

		}, 60); // <- run late so FooEvents markup exists

			/* C) On every checkout refresh, store submitted counts in the WC session */
			add_action( 'woocommerce_checkout_update_order_review', function( $post_data ){
				parse_str( $post_data, $arr );
				$counts = array();
				if ( ! empty( $arr['sl_temp_license_by_product'] ) && is_array( $arr['sl_temp_license_by_product'] ) ) {
					foreach ( $arr['sl_temp_license_by_product'] as $pid => $n ) {
						$pid = (int) $pid; $n = max( 0, (int) $n );
						if ( $pid ) $counts[ $pid ] = $n;
					}
				}
				WC()->session->set( 'sl_temp_lic_counts_by_pid', $counts );
			});

		/* D) Add fees from the saved per-product counts */
		add_action('woocommerce_cart_calculate_fees', function ($cart) {
			if (is_admin() && !defined('DOING_AJAX')) return;

			// Prefer the session (set during update_order_review)…
			$counts = WC()->session->get('sl_temp_lic_counts_by_pid', array());

			// …but if it’s empty and the form just posted, read the raw POST once
			if (empty($counts) && !empty($_POST['sl_temp_license_by_product']) && is_array($_POST['sl_temp_license_by_product'])) {
				foreach ($_POST['sl_temp_license_by_product'] as $pid => $n) {
					$pid = (int) $pid; $n = max(0, (int) $n);
					if ($pid && $n) $counts[$pid] = $n;
				}
			}
			if (empty($counts)) return;

			foreach ($counts as $pid => $qty) {
				$pid = (int) $pid;
				$qty = max(0, (int) $qty);
				if (!$pid || !$qty) continue;

				$fee_each = sl_temp_lic_fee_for_product($pid);
				if ($fee_each <= 0) continue;

				$product = wc_get_product($pid);
				$label   = sprintf(__('Temporary licence — %s × %d', 'startingline'),
					$product ? $product->get_name() : ('#' . $pid), $qty
				);
				$cart->add_fee($label, $fee_each * $qty, false);
			}
		}, 25);

		/* Optional: clear counts after order placed, so they don’t linger */
		add_action('woocommerce_thankyou', function () {
			if (function_exists('WC') && WC()->session) {
				WC()->session->__unset('sl_temp_lic_counts_by_pid');
			}
		});


/* E) Persist a small note on each event line about how many temp licences were chosen */
add_action( 'woocommerce_checkout_create_order_line_item', function( $item, $cart_item_key, $values ){
    $pid = (int) ( $values['product_id'] ?? 0 );
    if ( ! $pid ) return;
    $counts = WC()->session->get( 'sl_temp_lic_counts_by_pid', array() );
    if ( isset( $counts[$pid] ) && (int) $counts[$pid] > 0 ) {
        $item->add_meta_data( '_sl_temp_licences', (int) $counts[$pid], true );
    }
}, 10, 3 );

// Stamp "Temporary licence" fee items with the related event product id
add_action('woocommerce_checkout_create_order_fee_item', function( $item, $cart ){
    $name = $item->get_name();
    if ( stripos($name, 'Temporary licence') === false ) {
        return; // only touch our fee
    }

    // Try exact match via session map (how many temp licences per product in this order)
    $map = WC()->session ? (array) WC()->session->get('sl_temp_lic_counts_by_pid', []) : [];

    // Best effort: if there are multiple, match by product title contained in the fee name
    foreach ( $map as $pid => $qty ) {
        $title = get_the_title( (int) $pid );
        if ( $title && stripos( $name, $title ) !== false ) {
            $item->add_meta_data('_sl_temp_license', 1, true);
            $item->add_meta_data('_sl_temp_license_pid', (int) $pid, true);
            return;
        }
    }

    // Fallback: tag as temp licence without a pid (older orders / edge cases)
    $item->add_meta_data('_sl_temp_license', 1, true);
}, 10, 2);

		/** FooEvents — Temporary Licence per attendee (store choices on order + ticket) */

			/* 3a) On checkout: per cart line, remember which attendee indexes said “Yes”. */
			add_action('woocommerce_checkout_create_order_line_item', function( $item, $cart_item_key ) {

				$yes_idx = array();

				// Preferred structured format: sl_temp_lic[<cart_key>][] = [1,3,...]
				if ( ! empty($_POST['sl_temp_lic'][$cart_item_key]) ) {
					$yes_idx = array_map('intval', (array) $_POST['sl_temp_lic'][$cart_item_key]);
				}

				// Backup flat format: sl_temp_lic_flat[] = "<cart_key>:<idx>"
				if ( empty($yes_idx) && ! empty($_POST['sl_temp_lic_flat']) ) {
					$flat = (array) $_POST['sl_temp_lic_flat'];
					$k    = strtolower($cart_item_key);
					foreach ( $flat as $pair ) {
						if ( preg_match('/^([a-f0-9]{32}):(\d+)$/i', (string) $pair, $m) ) {
							if ( strtolower($m[1]) === $k ) $yes_idx[] = (int) $m[2];
						}
					}
				}

				if ( $yes_idx ) {
					$yes_idx = array_values(array_unique(array_filter($yes_idx, function($n){ return $n > 0; })));
					if ( $yes_idx ) {
						// Save e.g. [1,3] meaning attendee #1 and #3 in this line chose “Yes”
						$item->add_meta_data('_sl_temp_lic_yes_idx', $yes_idx, true);
					}
				}
			}, 10, 2);

			/* 3b) When FooEvents creates each ticket, mark that attendee yes/no and write to exporter-visible meta. */
			add_action('fooevents_ticket_created', function ($ticket_id) {

				$order_item_id = (int) get_post_meta($ticket_id, 'WooCommerceEventsOrderItemID', true);
				if (!$order_item_id) return;

				// Attendee number on the ticket is 1-based
				$idx = (int) get_post_meta($ticket_id, 'WooCommerceEventsAttendeeNumber', true);
				if ($idx <= 0) return;

				// “Yes” indices saved on the order item at checkout
				$yes_idx = (array) wc_get_order_item_meta($order_item_id, '_sl_temp_lic_yes_idx', true);
				$yes_idx = array_map('intval', $yes_idx);

				// Accept either 1-based (correct) or 0-based (older attempts)
				$hit = in_array($idx, $yes_idx, true) || in_array($idx - 1, $yes_idx, true);

				$value = $hit ? 'yes' : 'no';
				$label = $hit ? 'Yes' : 'No';

				// Our own flag
				update_post_meta($ticket_id, '_sl_attendee_temp_license', $value);

				// What your CSV exporter is reading (column header is "temp_license")
				update_post_meta($ticket_id, 'temp_license', $label);

				// Also write to common FooEvents custom-field stores (harmless if unused)
				update_post_meta($ticket_id, 'WooCommerceEventsCustomAttendeeField_temp_license', $label);
				$fields = get_post_meta($ticket_id, 'WooCommerceEventsCustomAttendeeFields', true);
				if (!is_array($fields)) $fields = array();
				$fields['temp_license'] = $label;
				update_post_meta($ticket_id, 'WooCommerceEventsCustomAttendeeFields', $fields);
			});