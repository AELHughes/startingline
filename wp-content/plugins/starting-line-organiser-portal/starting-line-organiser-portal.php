<?php
/**
 * Plugin Name: Starting Line Organiser Portal
 * Description: Lightweight organiser portal for FooEvents (no React). Dashboard, per-variation capacity/remaining, filters (date/event/status), CSV export, organiser registration, organiser profile, and Create/Edit Event (draft). Includes organiser-only draft viewing and a request-change workflow for published events.
 * Version: 1.6.8
 * Author: Starting Line
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) { exit; }

if (!class_exists('SL_Organiser_Portal')) {

class SL_Organiser_Portal {

    const VERSION = '1.6.8';
    const SLUG    = 'organiser-portal';                           // Page slug

    // Shortcodes (historical names kept)
    const SHORTCODE_DASH = 'organizer_dashboard';
    const SHORTCODE_REG  = 'organizer_register';

    // Capabilities
    const CAP_VIEW_PORTAL = 'foop_view_portal';
    const CAP_EXPORT_CSV  = 'foop_export_attendees';

    // Query vars
    const QV_FROM   = 'foop_from';
    const QV_TO     = 'foop_to';
    const QV_QUICK  = 'foop_quick';
    const QV_EVENT  = 'foop_event';
    const QV_STATUS = 'foop_status';
    const QV_TAB    = 'foop_tab';
    // NEW (paging/search)
    const QV_PAGE     = 'foop_p';
    const QV_PER_PAGE = 'foop_pp';
    const QV_SEARCH   = 'foop_q';

    // Data sources
    const TICKET_POST_TYPE     = 'event_magic_tickets';
    const TICKET_PRODUCT_META  = 'WooCommerceEventsProductID';
    const CUSTOM_FIELD_PREFIX  = 'fooevents_custom_';
    const PRODUCT_ORGANIZERS_META = '_foop_organizer_ids';
    const ORDER_ORGANIZERS_META   = '_foop_organizer_ids';

    // Categories (event + merch)
    private $event_categories = array(
        'road-cycling'   => 'Road Cycling',
        'road-running'   => 'Road Running',
        'mountain-biking'=> 'Mountain Biking',
        'trail-running'  => 'Trail Running',
        'triathlon'      => 'Triathlon',
    );
    private $merch_category_slug = 'merchandise';

    private $capacity_meta_keys = array('_foop_capacity','foop_capacity','_capacity','capacity','sl_capacity');

    public static function init(){ static $i=null; if($i===null){ $i=new self(); } return $i; }

    public function __construct(){
        register_activation_hook(__FILE__, array($this,'on_activate'));
        register_deactivation_hook(__FILE__, array($this,'on_deactivate'));
		
		// Under main image area (inside the images block)
		add_action('woocommerce_product_thumbnails', array($this,'render_organizer_badge_under_image'), 999);
        add_action('wp_enqueue_scripts', array($this,'enqueue_single_product_org_css'));
		
		add_action('woocommerce_after_shop_loop_item_title', array($this,'foop_output_city_below_venue'), 99);
		
		add_filter('woocommerce_login_redirect', array($this,'login_redirect_to_portal'), 10, 2);
		add_action('template_redirect',          array($this,'redirect_organizer_from_my_account'), 6);
		
		// Event merchandise UI on single product + checkout quick-add + AJAX
		add_action('woocommerce_after_single_product_summary', array($this,'render_event_merch_under_map'), 100);
		add_action('woocommerce_checkout_before_order_review', array($this,'render_checkout_merch_upsell'), 5);
		add_action('wp_ajax_foop_add_merch',        array($this,'ajax_add_merch_to_cart'));
		add_action('wp_ajax_nopriv_foop_add_merch', array($this,'ajax_add_merch_to_cart'));

        // Product ownership UI in wp-admin
        add_action('add_meta_boxes', array($this,'add_product_meta_box'));
        add_action('save_post_product', array($this,'save_product_meta'), 10, 2);

        // Tag orders with organiser ids (for later reporting)
        add_action('woocommerce_checkout_create_order', array($this,'tag_order_with_organizers'), 10, 2);

        // Shortcodes
        add_shortcode(self::SHORTCODE_DASH, array($this,'shortcode_dashboard'));
        add_shortcode(self::SHORTCODE_REG,  array($this,'shortcode_register'));

        // Assets
        add_action('wp_enqueue_scripts', array($this,'enqueue_assets'));

        // My Account endpoint & menu
        add_action('init', array($this,'add_account_endpoint'));
        add_filter('woocommerce_account_menu_items', array($this,'filter_account_menu_items'));
        add_action('woocommerce_account_organizer_endpoint', array($this,'render_account_endpoint'));
        add_filter('woocommerce_get_endpoint_url', array($this,'override_endpoint_url'), 10, 4);

        // Handle submits
        add_action('template_redirect', array($this,'maybe_handle_create_event_submit'));
        add_action('template_redirect', array($this,'maybe_handle_register_submit'));
        add_action('template_redirect', array($this,'maybe_handle_profile_submit'));

        // Allow organiser to view their own draft products (front end)
        add_action('pre_get_posts', array($this,'maybe_allow_owner_view_draft'));
        add_filter('the_posts',     array($this,'restrict_draft_view_to_owner'), 10, 2);

        // Portal page content replacement
        add_filter('the_content', array($this,'maybe_replace_portal_page_content'));

        // CSV export
        add_action('wp_ajax_foop_export_participants',        array($this,'ajax_export_participants'));
        add_action('wp_ajax_nopriv_foop_export_participants', array($this,'ajax_export_participants'));

        // Request-change endpoint
        add_action('wp_ajax_foop_request_change', array($this,'ajax_request_change'));

        // Backfill CAF as late as possible
        add_action('woocommerce_after_product_object_save', array($this,'caf_backfill_after_wc_save'), PHP_INT_MAX, 1);
        add_action('shutdown', array($this,'caf_backfill_on_shutdown'), PHP_INT_MAX);

        add_action( 'template_redirect', array( $this, 'redirect_registration_to_portal' ), 5 );
		
		// Single product: Event Merchandise block
		add_action( 'woocommerce_after_single_product_summary', array( $this, 'render_event_merch_block' ), 25 );

		// Checkout: Event Merchandise block
		add_action( 'woocommerce_checkout_order_review', array( $this, 'render_checkout_merch_block' ), 5 );

		// Keep user on Checkout when they click "Add" there
		add_filter( 'woocommerce_add_to_cart_redirect', array( $this, 'stay_on_checkout_after_add' ) );
		
    }
	
	/* ----------------------------------------
	 * CHUNK 2/8
     * ----------------------------------------- */

    /**
     * If an organiser (non-admin) opens the organiser-registration page,
     * send them to the portal. Admins can still view/edit the page.
     */
    public function redirect_registration_to_portal() {
        if ( ! is_user_logged_in() ) return;
        if ( is_admin() || wp_doing_ajax() ) return;
        if ( current_user_can( 'manage_options' ) ) return;
        if ( ! is_singular() ) return;
        $post = get_post(); if ( ! $post ) return;
        if ( $post->post_name !== 'organiser-registration' ) return;
        if ( ! $this->current_user_is_organizer_like() ) return;
        $dest = $this->portal_page_url(); if ( empty( $dest ) ) return;
        global $wp;
        $here = home_url( add_query_arg( array(), isset( $wp->request ) ? $wp->request : '' ) );
        if ( untrailingslashit( $dest ) === untrailingslashit( $here ) ) return;
        nocache_headers();
        wp_safe_redirect( $dest, 302 );
        exit;
    }

    /* -------------------------------------------------
     * Activation / helpers
     * ------------------------------------------------- */
    public function on_activate(){
        // Roles & caps
        $caps=array('read'=>true);
        add_role('event_organizer',__('Event Organizer','slop'),$caps);
        $this->grant_cap_to_role('event_organizer', self::CAP_VIEW_PORTAL);
        $this->grant_cap_to_role('event_organizer', self::CAP_EXPORT_CSV);
        $this->grant_cap_to_role('administrator',   self::CAP_VIEW_PORTAL);
        $this->grant_cap_to_role('administrator',   self::CAP_EXPORT_CSV);

        // Ensure portal page exists
        $page = get_page_by_path(self::SLUG);
        if (!$page) {
            wp_insert_post(array(
                'post_title'   => 'Organiser Portal',
                'post_name'    => self::SLUG,
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => '['.self::SHORTCODE_DASH.']',
            ));
        }

        // Ensure required product categories exist
        $this->ensure_event_and_merch_categories();

        $this->add_account_endpoint();
        flush_rewrite_rules();
    }
    public function on_deactivate(){ flush_rewrite_rules(); }
    private function grant_cap_to_role($role,$cap){ if($r=get_role($role)){ if(!$r->has_cap($cap)) $r->add_cap($cap); } }

    private function ensure_event_and_merch_categories(){
        if(!taxonomy_exists('product_cat')) return;
        foreach($this->event_categories as $slug=>$name){
            if(!term_exists($slug,'product_cat')){
                wp_insert_term($name,'product_cat',array('slug'=>$slug));
            }
        }
        if(!term_exists($this->merch_category_slug,'product_cat')){
            wp_insert_term('Merchandise','product_cat',array('slug'=>$this->merch_category_slug));
        }
    }

    private function is_portal_page(){ return (function_exists('is_page') && is_page(self::SLUG)); }
    private function portal_page_url(){
        $page = get_page_by_path(self::SLUG);
        return $page ? get_permalink($page) : home_url('/'.self::SLUG.'/');
    }

    /* -------------------------------------------------
     * Assets (CSS/JS)
     * ------------------------------------------------- */
    public function enqueue_assets(){
        $should = false;
         if ($this->is_portal_page()) $should=true;
         if(is_singular() && has_shortcode(get_post_field('post_content', get_the_ID()), self::SHORTCODE_DASH)) $should=true;
         if(is_singular() && has_shortcode(get_post_field('post_content', get_the_ID()), self::SHORTCODE_REG))  $should=true; // allow on register page while logged out
         if(function_exists('is_account_page') && is_account_page()) $should=true;
         if(!$should) return;

        $orange = '#f05a28';
        $css  = ':root{--sl-orange:'.$orange.';--sl-muted:#6b7280;--sl-border:#e5e7eb}';
        $css .= ' .foop-wrap{max-width:1200px;margin:0 auto}
.foop-grid{display:grid;grid-template-columns:240px 1fr;gap:1rem}
@media(max-width:900px){.foop-grid{grid-template-columns:1fr}}
.foop-sidenav{border:1px solid var(--sl-border);border-radius:12px;background:#fff}
.foop-sidenav h4{margin:.9rem 1rem}
.foop-sidenav a{display:block;padding:.7rem 1rem;border-top:1px solid #f1f1f1;text-decoration:none;color:#111}
.foop-sidenav a.active{background:#fff5f1;border-left:4px solid var(--sl-orange);padding-left:.75rem}
.foop-summary{margin:1rem 0;padding:.75rem 1rem;background:#f6f7f7;border:1px solid var(--sl-border);border-radius:12px}
.foop-filters{margin:1rem 0;padding:.75rem 1rem;border:1px solid var(--sl-border);border-radius:12px;background:#fff;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.foop-filters label{display:inline-flex;gap:.35rem;align-items:center;margin-right:.5rem}
.foop-filters input[type=date], .foop-filters input[type=search], .foop-filters select{padding:.45rem .6rem;border:1px solid #ddd;border-radius:8px}
.foop-filters a.btn, .foop-filters button.btn{display:inline-block;padding:.5rem .9rem;border:1px solid #ddd;border-radius:8px;background:#fff;text-decoration:none;color:#111;line-height:1}
.foop-filters a.btn:hover, .foop-filters button.btn:hover{background:#f7f7f7}
.foop-filters .btn.active{font-weight:600;border-color:var(--sl-orange)}
.foop-filters .btn-primary{border-color:var(--sl-orange);background:var(--sl-orange);color:#fff}
.foop-filters .btn-primary:hover{filter:brightness(0.95);color:#fff}
/* Filters overflow & spacing fixes */
.foop-filters{overflow:hidden} /* prevent any focus outline from spilling outside the card */
.foop-filters label{margin:0 .5rem .5rem 0}
.foop-filters input[type=date],
.foop-filters input[type=search],
.foop-filters select{
  box-sizing:border-box;
  max-width:260px; /* keep controls from pushing into the border */
}

/* Mobile: full width controls in one column */
@media(max-width:900px){
  .foop-filters label{width:100%}
  .foop-filters input[type=date],
  .foop-filters input[type=search],
  .foop-filters select{max-width:100%}
}

/* Toggle button in the summary bar */
.foop-summary a.btn{
  display:inline-block;
  padding:.45rem .75rem;
  border:1px solid #ddd;
  border-radius:8px;
  background:#fff;
  text-decoration:none;
  color:#111;
  line-height:1;
}
.foop-summary a.btn:hover{background:#f7f7f7}

/* Collapsed state */
.foop-filters.is-collapsed{display:none}
.foop-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.foop-table{width:100%;border-collapse:collapse;margin:1rem 0;min-width:980px}
.foop-table th,.foop-table td{border:1px solid #eee;padding:10px;text-align:left;vertical-align:top}
.foop-table th{background:#f9fafb}
.foop-badge{display:inline-block;padding:2px 8px;border-radius:12px;background:#efefef}
.foop-dot{display:inline-block;width:10px;height:10px;border-radius:50%}
.foop-dot.green{background:#46b450}.foop-dot.amber{background:#ffb900}.foop-dot.red{background:#d63638}.foop-dot.grey{background:#9ca3af}
.foop-badge-draft{display:inline-block;padding:2px 8px;border-radius:12px;background:#eef2f7;color:#374151;font-weight:600}
.foop-td-status{text-align:center}
.foop-start{white-space:nowrap}
.foop-card{border:1px solid var(--sl-border);border-radius:12px;padding:1rem;background:#fff;margin:.5rem 0}
.foop-steps{display:flex;gap:.5rem;margin:.5rem 0 1rem 0;flex-wrap:wrap}
.foop-step{padding:.4rem .8rem;border:1px dashed #333;border-radius:8px;background:#fff5f1}
.foop-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.foop-form-row label{display:block;font-weight:600;margin:.5rem 0 .3rem}
.foop-form-row input,.foop-form-row textarea,.foop-form-row select{width:100%;padding:.5rem;border:1px solid #ddd;border-radius:8px}
.foop-repeater .item{border:1px dashed #ddd;border-radius:8px;padding:.75rem;margin:.5rem 0}
.foop-actions-right{text-align:right}
.foop-btn{display:inline-block;padding:.6rem 1rem;border-radius:8px;border:1px solid var(--sl-orange);background:var(--sl-orange);color:#fff;text-decoration:none}
.foop-btn[disabled]{opacity:.6;cursor:not-allowed}

/* Registration & Profile page styling */
.foop-reg h2{margin:1rem 0 1rem}
.foop-reg form{border:1px solid var(--sl-border);border-radius:12px;background:#fff;padding:1rem}
.foop-reg .row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.foop-reg label{display:block;font-weight:600;margin:6px 0}
.foop-reg input{width:100%;padding:.6rem;border:1px solid #ddd;border-radius:8px}
.foop-reg .help{display:block;color:var(--sl-muted);font-size:12px;margin-top:4px}
.foop-button{display:inline-block;background:var(--sl-orange);color:#fff;border:1px solid var(--sl-orange);border-radius:8px;padding:.6rem 1.1rem;text-decoration:none}
.foop-note{color:#374151}

/* Inline field error styling for registration */
.foop-field-error{color:#d63638;font-size:12px;margin-top:4px}
.foop-reg input[aria-invalid="true"]{border-color:#d63638;background:#fff7f7}

/* Modal */
.foop-modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:99999}
.foop-modal.open{display:flex}
.foop-modal-card{background:#fff;border-radius:12px;max-width:720px;width:calc(100% - 2rem);max-height:80vh;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.2);padding:16px}
.foop-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}
.foop-close{border:0;background:transparent;font-size:24px;line-height:1;cursor:pointer}
.foop-vars-table{width:100%;border-collapse:collapse}
.foop-vars-table th,.foop-vars-table td{border:1px solid #eee;padding:8px;text-align:left}

/* Overlay loader used on submit */
.foop-overlay{position:fixed;inset:0;background:rgba(255,255,255,.9);display:none;z-index:99998;align-items:center;justify-content:center}
.foop-overlay.open{display:flex}
.foop-spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:var(--sl-orange);border-radius:50%;animation:foopspin 1s linear infinite}
@keyframes foopspin{to{transform:rotate(360deg)}}

/* Mobile stacked table cards */
@media (max-width:760px){
  .foop-table{min-width:0;border:0}
  .foop-table thead{display:none}
  .foop-table,.foop-table tbody,.foop-table tr,.foop-table td{display:block;width:100%}
  .foop-table tr{border:1px solid var(--sl-border);border-radius:12px;padding:12px;margin-bottom:12px;background:#fff}
  .foop-table td{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border:0}
  .foop-table td::before{content:attr(data-label);min-width:40%;color:var(--sl-muted);font-weight:600}
  .foop-table td .foop-badge{align-self:flex-start}
}

/* ---Thumbnail image for event on edit--- */
.foop-image-input{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.foop-thumb-wrap{ width:84px; height:84px; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#fff; }
.foop-thumb{ width:100%; height:100%; object-fit:cover; display:block; }
@media (max-width:640px){
  .foop-thumb-wrap{ width:72px; height:72px; border-radius:8px; }
}

/* --- organiser dashboard: pager --- */
.foop-pager{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin:.5rem 0 0}
.foop-pager__links .btn{display:inline-block;padding:.45rem .7rem;border:1px solid var(--sl-border);border-radius:8px;background:#fff;text-decoration:none;margin-right:6px;line-height:1}
.foop-pager__links .btn.is-active{background:var(--sl-orange);border-color:var(--sl-orange);color:#fff}
@media(max-width:760px){.foop-pager{flex-direction:column;align-items:flex-start}}

/* Distance placeholder should be grey */
.foop-distance-ph::placeholder{color:#e5e7eb;opacity:1}
.foop-distance-ph::-webkit-input-placeholder{color:#e5e7eb;opacity:1}
.foop-distance-ph::-moz-placeholder{color:#e5e7eb;opacity:1}
.foop-distance-ph:-ms-input-placeholder{color:#e5e7eb;opacity:1}
.foop-distance-ph::-ms-input-placeholder{color:#e5e7eb;opacity:1}
';
        wp_register_style('foop-inline', false); wp_enqueue_style('foop-inline'); wp_add_inline_style('foop-inline',$css);

        // --- JS (repeaters, modal, request-change, overlay, validation, Google Places) ---
        $js = <<<'JS'
		
		/* Normalize website fields before browser validation:
		   if the value lacks http/https, prefix https:// so type=url accepts it. */
		document.addEventListener('submit', function (e) {
		  var f = e.target;
		  if (!f) return;
		  var inp = f.querySelector('input[name="website"]');
		  if (!inp) return;
		  var v = (inp.value || '').trim();
		  if (v && !/^https?:\/\//i.test(v)) { inp.value = 'https://' + v; }
		}, true); // capture phase so it runs before native validation
		
/* Global click handlers (repeaters, modals) */
document.addEventListener('click', function(e){
  var t=e.target;

  // Distances repeater
  if(t.matches('[data-add-distance]')){
    e.preventDefault();
    var wrap=document.querySelector('#foop-distances'); if(!wrap) return;
    var idx=wrap.children.length;
    var tpl=document.getElementById('foop-distance-template').innerHTML.replace(/__i__/g, idx);
	var div=document.createElement('div'); div.className='item'; div.innerHTML=tpl; wrap.appendChild(div);
	var err=document.getElementById('foop-distances-error'); if(err){ err.style.display='none'; }
	var card=document.getElementById('foop-distances-card'); if(card){ card.style.borderColor=''; }
	return;
  }
  if(t.matches('[data-remove-item]')){
    e.preventDefault(); var it=t.closest('.item'); if(it) it.remove(); return;
  }

  // Merch repeater
  if(t.matches('[data-add-merch]')){
    e.preventDefault();
    var w=document.querySelector('#foop-merch'); if(!w) return;
    var i=w.children.length;
    var tpl=document.getElementById('foop-merch-template').innerHTML.replace(/__i__/g, i);
    var div=document.createElement('div'); div.className='item'; div.innerHTML=tpl; w.appendChild(div); return;
  }

  // Open variations modal (Breakdown)
  var breakdownBtn = t.closest('a.foop-breakdown, a.foop-view-vars');
  if(breakdownBtn){
    e.preventDefault();
    var id=breakdownBtn.getAttribute('data-event');
    var tpl=document.getElementById('foop-vars-'+id);
    var html=tpl ? tpl.innerHTML : '<p>No variations found.</p>';
    var modal=document.getElementById('foop-modal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='foop-modal'; modal.className='foop-modal';
      modal.innerHTML='<div class="foop-modal-card"><div class="foop-modal-header"><h3>Variation breakdown</h3><button class="foop-close" aria-label="Close">&times;</button></div><div class="foop-modal-body"></div></div>';
      document.body.appendChild(modal);
    }
    modal.querySelector('.foop-modal-body').innerHTML = html;
    modal.classList.add('open'); return;
  }

  // Request change modal
  if(t.matches('a.foop-request-change')){
    e.preventDefault();
    var id=t.getAttribute('data-event');
    var modal=document.getElementById('foop-rc-modal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='foop-rc-modal'; modal.className='foop-modal';
      modal.innerHTML='<div class="foop-modal-card"><div class="foop-modal-header"><h3>Request a change</h3><button class="foop-close" aria-label="Close">&times;</button></div><div class="foop-modal-body"><form id="foop-rc-form"><input type="hidden" name="action" value="foop_request_change"><input type="hidden" name="event_id" value="'+id+'"><input type="hidden" name="nonce" value="'+(window.foopNonce||'')+'"><p><label><input type="radio" name="type" value="cancel" checked> Request cancellation</label></p><p><label><input type="radio" name="type" value="date_change"> Request date change</label></p><p><label>Details / Reason</label><br><textarea name="message" rows="4" style="width:100%"></textarea></p><div class="foop-actions-right"><button type="submit" class="foop-btn">Send request</button></div></form></div></div>';
      document.body.appendChild(modal);
    } else {
      modal.querySelector('input[name="event_id"]').value=id;
    }
    modal.classList.add('open'); return;
  }

  // Close modal
  if(t.classList && t.classList.contains('foop-close')){
    var m=t.closest('.foop-modal'); if(m){ m.classList.remove('open'); } return;
  }
  
    // Toggle filters open/closed
  if (t.matches('[data-toggle-filters]')) {
    e.preventDefault();
    var box = document.getElementById('foop-filters');
    if (!box) return;
    box.classList.toggle('is-collapsed');
    var hidden = box.classList.contains('is-collapsed');
    t.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    t.textContent = hidden ? 'Show filters' : 'Hide filters';
    try { localStorage.setItem('foopFiltersCollapsed', hidden ? '1' : '0'); } catch (_){}
    return;
  }
  
});
document.addEventListener('mousedown', function(e){
  var m=document.querySelector('.foop-modal.open'); if(m && e.target===m){ m.classList.remove('open'); }
});

	// Request-change submit
	document.addEventListener('submit', function(e){
	  var f=e.target;
	  if(f && f.id==='foop-rc-form'){
		e.preventDefault();
		var overlay=document.getElementById('foop-overlay'); if(overlay) overlay.classList.add('open');
		var fd=new FormData(f);
		fetch((window.ajaxurl||document.body.getAttribute('data-ajaxurl')||'/wp-admin/admin-ajax.php'),{method:'POST',body:fd,credentials:'same-origin'})
		  .then(r=>r.json()).then(function(json){
			alert(json && json.data ? json.data : 'Request sent.');
			var m=document.getElementById('foop-rc-modal'); if(m) m.classList.remove('open');
		  }).catch(function(){ alert('Something went wrong sending your request.'); })
		  .finally(function(){ var overlay=document.getElementById('foop-overlay'); if(overlay) overlay.classList.remove('open'); });
	  }
	});
	// Live preview for the Event image input
	document.addEventListener('change', function(e){
	  var inp = e.target;
	  if (!(inp && inp.matches('input[name="event_image"]'))) return;
	  var wrap = inp.closest('.foop-image-input');
	  if (!wrap) return;
	  var file = inp.files && inp.files[0];
	  if (!file) return;
	  var url = URL.createObjectURL(file);
	  var box = wrap.querySelector('.foop-thumb-wrap');
	  if (!box) {
		box = document.createElement('div');
		box.className = 'foop-thumb-wrap';
		wrap.prepend(box);
	  }
	  var img = box.querySelector('img.foop-thumb');
	  if (!img) {
		img = document.createElement('img');
		img.className = 'foop-thumb';
		img.alt = 'Preview';
		box.appendChild(img);
	  }
	  img.src = url;
	});
	
	// Init filters toggle from saved state
	document.addEventListener('DOMContentLoaded', function(){
	  var box = document.getElementById('foop-filters');
	  var btn = document.querySelector('[data-toggle-filters]');
	  if (!box || !btn) return;
	  var hidden = false;
	  try { hidden = (localStorage.getItem('foopFiltersCollapsed') === '1'); } catch (_){}
	  if (hidden) {
		box.classList.add('is-collapsed');
		btn.textContent = 'Show filters';
		btn.setAttribute('aria-expanded','false');
	  } else {
		btn.textContent = 'Hide filters';
		btn.setAttribute('aria-expanded','true');
	  }
	});

		/* ---- Toggle the Merchandise block on the Create/Edit Event form ---- */
		function slToggleMerchBox(){
		  var sel = document.querySelector('select[name="merch_toggle"]');
		  var box = document.querySelector('[data-merch-box]');
		  if (!box) return;
		  var on = (sel && sel.value === 'yes');
		  box.style.display = on ? '' : 'none';
		  // If turning off, clear any rows so nothing saves accidentally
		  if (!on) {
			var wrap = document.getElementById('foop-merch');
			if (wrap) wrap.innerHTML = '';
		  }
		}
		document.addEventListener('change', function(e){
		  if (e.target && e.target.name === 'merch_toggle') slToggleMerchBox();
		});
		document.addEventListener('DOMContentLoaded', slToggleMerchBox);


JS;
        wp_register_script('foop-inline-js', '', array(), self::VERSION, true);
        wp_enqueue_script('foop-inline-js');
        wp_add_inline_script('foop-inline-js', $js);
		

		// If Google Places API key is set in wp-config (supports multiple constant names), enqueue Places API with a callback
		$gkey = defined('GOOGLE_MAPS_API_KEY') ? trim(constant('GOOGLE_MAPS_API_KEY')) :
				(defined('FOOP_GOOGLE_MAPS_KEY') ? trim(constant('FOOP_GOOGLE_MAPS_KEY')) :
				(defined('FOOP_GOOGLE_API_KEY')  ? trim(constant('FOOP_GOOGLE_API_KEY'))  :
				(defined('GOOGLE_API_KEY')       ? trim(constant('GOOGLE_API_KEY'))       : '')));

		if ($gkey !== '') {
			// Define the global callback BEFORE loading the Google script
			$callback = <<<'PLACES'
			window.foopInitPlaces = function(){
			  try{
				if (!window.google || !google.maps || !google.maps.places) return;

				function fillAddress(f, components){
				  if(!components) return;
				  var byType = {};
				  components.forEach(function(c){
					(c.types||[]).forEach(function(t){ byType[t]=c.long_name; });
				  });
				  var addr1 = f.querySelector('input[name="addr1"]');
				  var addr2 = f.querySelector('input[name="addr2"]');
				  var city  = f.querySelector('input[name="city"]');
				  var prov  = f.querySelector('input[name="province"]');
				  var route = byType.route || "";
				  var num   = byType.street_number || "";
				  if(addr1 && (route || num)){ addr1.value = (num?num+" ":"")+route; }
				  if(addr2){
					var sublocal = byType.sublocality || byType.sublocality_level_1 || "";
					if(sublocal) addr2.value = sublocal;
				  }
				  if(city && (byType.locality || byType.postal_town)) city.value = byType.locality || byType.postal_town;
				  if(prov && byType.administrative_area_level_1)      prov.value = byType.administrative_area_level_1;
				}

				document.querySelectorAll('input[data-foop-places]').forEach(function(input){
				  if (input._foopPlacesInit) return;
				  input._foopPlacesInit = true;
				  var ac = new google.maps.places.Autocomplete(input, {
					fields: ['geometry','name','formatted_address','address_components'],
					types: ['geocode','establishment']
				  });
				  ac.addListener('place_changed', function(){
					var p = ac.getPlace();
					if (!p || !p.geometry || !p.geometry.location) return;
					var lat = p.geometry.location.lat();
					var lng = p.geometry.location.lng();
					var f   = input.closest('form');
					if (!f) return;

					var latInp = f.querySelector('input[name="map_lat"]');
					var lngInp = f.querySelector('input[name="map_lng"]');
					if (!latInp){ latInp = document.createElement('input'); latInp.type='hidden'; latInp.name='map_lat'; f.appendChild(latInp); }
					if (!lngInp){ lngInp = document.createElement('input'); lngInp.type='hidden'; lngInp.name='map_lng'; f.appendChild(lngInp); }
					latInp.value = String(lat);
					lngInp.value = String(lng);

					var hint = f.querySelector('input[name="map_hint"]');
					if (hint){ hint.value = lat.toFixed(6)+','+lng.toFixed(6); }

					var v = f.querySelector('input[name="venue_name"]');
					if (v && (!v.value || v.value.trim()==='') && p.name){ v.value = p.name; }

					fillAddress(f, p.address_components||[]);
				  });
				});
			  }catch(e){}
			};
			PLACES;

			// Register → attach callback "before" → enqueue with callback param
			$url = 'https://maps.googleapis.com/maps/api/js?key=' . rawurlencode($gkey) . '&libraries=places&v=quarterly&callback=foopInitPlaces';
			wp_register_script('foop-google-places', esc_url_raw($url), array(), self::VERSION, true);
			wp_add_inline_script('foop-google-places', $callback, 'before');
			wp_enqueue_script('foop-google-places');
		}

        // Output overlay node
        add_action('wp_footer', function(){
            echo '<div id="foop-overlay" class="foop-overlay"><div class="foop-spinner" role="status" aria-label="Loading"></div></div>';
        });
    }
	
	/* ----------------------------------------
	 * CHUNK 3/8
     * ----------------------------------------- */
	
	
    /* -------------------------------------------------
     * Account endpoint + menu
     * ------------------------------------------------- */
    public function add_account_endpoint(){ add_rewrite_endpoint('organizer', EP_ROOT|EP_PAGES); }

    public function filter_account_menu_items($items){
        // Label change to "Portal"
        $new=array();
        foreach($items as $key=>$label){
            $new[$key]=$label;
            if('dashboard'===$key){ $new['organizer']=__('Portal','slop'); }
        }
        if(!isset($new['organizer'])) $new['organizer']=__('Portal','slop');

        // For organisers (non-admin): show only Portal + Log out
        if( is_user_logged_in() && $this->current_user_is_organizer_like() && !current_user_can('administrator') ){
            $restricted = array(
                'organizer'        => __('Portal','slop'),
                'customer-logout'  => isset($new['customer-logout']) ? $new['customer-logout'] : __('Log out','woocommerce'),
            );
            return $restricted;
        }
        return $new;
    }
    public function override_endpoint_url($url, $endpoint, $value, $permalink){
        if($endpoint==='organizer'){ return $this->portal_page_url(); }
        return $url;
    }
    public function render_account_endpoint(){ echo $this->render_portal_html(); }

    /* -------------------------------------------------
     * Admin meta box to assign product "owners"
     * ------------------------------------------------- */
    public function add_product_meta_box(){ add_meta_box('foop_organizers_box',__('Organiser(s)','slop'),array($this,'render_product_meta_box'),'product','side','default'); }
    public function render_product_meta_box($post){
        wp_nonce_field('foop_save_product_meta','foop_nonce');
        $selected=(array)get_post_meta($post->ID,self::PRODUCT_ORGANIZERS_META,true); if(!is_array($selected)) $selected=array();
        $users=get_users(array('role__in'=>array('event_organizer','administrator'),'orderby'=>'display_name','order'=>'ASC','number'=>999,'fields'=>array('ID','display_name','user_email')));
        echo '<p>'.esc_html__('Select the organiser accounts who own/manage this product.','slop').'</p><select name="foop_organizer_ids[]" multiple="multiple" style="width:100%;min-height:160px">';
        foreach($users as $u){ $sel=in_array($u->ID,$selected)?'selected':''; printf('<option value="%d" %s>%s (%s)</option>',intval($u->ID),$sel,esc_html($u->display_name),esc_html($u->user_email)); }
        echo '</select>';
    }
    public function save_product_meta($post_id,$post){
        if(!isset($_POST['foop_nonce'])||!wp_verify_nonce($_POST['foop_nonce'],'foop_save_product_meta')) return;
        if(defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE) return; if($post->post_type!=='product') return; if(!current_user_can('edit_post',$post_id)) return;
        $ids=isset($_POST['foop_organizer_ids'])?(array)$_POST['foop_organizer_ids']:array(); $ids=array_values(array_unique(array_map('intval',$ids)));
        update_post_meta($post_id,self::PRODUCT_ORGANIZERS_META,$ids);
    }

    /**
     * Ensure FooEvents attendee capture + order email flags are ON
     * and create the default Custom Attendee Fields on the product.
     */
    private function ensure_default_attendee_fields($product_id){
        $product_id = (int) $product_id;
        if (!$product_id) return;
        $existing = get_post_meta($product_id, 'WooCommerceEventsCustomAttendeeFields', true);
        if (is_array($existing) && !empty($existing)) return;
        $fields = array(
            array('label'=>'ID Number',          'type'=>'alphanumeric', 'options'=>'', 'default'=>'', 'required'=>'yes', 'uid'=>uniqid('caf_')),
            array('label'=>'Medical Aid',        'type'=>'text',         'options'=>'', 'default'=>'', 'required'=>'no',  'uid'=>uniqid('caf_')),
            array('label'=>'Medical Aid Number', 'type'=>'alphanumeric', 'options'=>'', 'default'=>'', 'required'=>'no',  'uid'=>uniqid('caf_')),
            array('label'=>'Medical Conditions', 'type'=>'textarea',     'options'=>'', 'default'=>'', 'required'=>'no',  'uid'=>uniqid('caf_')),
        );
        $json = wp_json_encode($fields);
        update_post_meta($product_id, 'WooCommerceEventsCustomAttendeeFields',       $fields);
        update_post_meta($product_id, 'WooCommerceEventsCustomAttendeeFieldsJSON',   $json);
        update_post_meta($product_id, 'WooCommerceEventsCustomAttendeeFieldsJson',   $json);
        update_post_meta($product_id, 'WooCommerceEventsCustomAttendeeFieldsCount',  count($fields));
        update_post_meta($product_id, 'WooCommerceEventsCaptureAttendeeDetails',        'on');
        update_post_meta($product_id, 'WooCommerceEventsIncludeCustomAttendeeDetails',  'on');
        update_post_meta($product_id, 'WooCommerceEventsCaptureAttendeeEmail',          'on');
        update_post_meta($product_id, 'WooCommerceEventsCaptureAttendeeTelephone',      'on');
        update_post_meta($product_id, 'WooCommerceEventsEventDetailsNewOrder',          'on');
        update_post_meta($product_id, 'WooCommerceEventsDisplayAttendeeNewOrder',       'on');
        update_post_meta($product_id, 'WooCommerceEventsTicketPurchaserDetails',        'on');
        if (function_exists('wc_delete_product_transients')) wc_delete_product_transients($product_id);
        clean_post_cache($product_id);
    }

    /**
     * Tag a newly-created order with organiser IDs based on the products in the order.
     * Also stores the organiser IDs on each line item for reporting.
     */
    public function tag_order_with_organizers( $order, $data ) {
        try {
            if ( ! $order || ! is_a( $order, 'WC_Order' ) ) return;
            $all_organizers = array();
            foreach ( $order->get_items( 'line_item' ) as $item_id => $item ) {
                $product = $item->get_product(); if ( ! $product ) continue;
                $pid    = $product->get_id();
                $owners = get_post_meta( $pid, self::PRODUCT_ORGANIZERS_META, true );
                if ( empty( $owners ) && $product->is_type( 'variation' ) ) {
                    $parent_id = $product->get_parent_id();
                    if ( $parent_id ) $owners = get_post_meta( $parent_id, self::PRODUCT_ORGANIZERS_META, true );
                }
                $owners = is_array( $owners ) ? $owners : ( $owners ? array( $owners ) : array() );
                $owners = array_values( array_unique( array_map( 'intval', $owners ) ) );
                if ( ! empty( $owners ) ) {
                    $item->add_meta_data( '_foop_organizer_ids', $owners, true );
                    foreach ( $owners as $oid ) { if ( $oid ) $all_organizers[ $oid ] = $oid; }
                }
            }
            if ( ! empty( $all_organizers ) ) {
                $order->update_meta_data( self::ORDER_ORGANIZERS_META, array_values( $all_organizers ) );
            }
            $order->save();
        } catch ( \Throwable $e ) {}
    }

    /* -------------------------------------------------
     * Helpers
     * ------------------------------------------------- */
    private function current_user_is_organizer_like(){
        if(!is_user_logged_in()) return false;
        $u=wp_get_current_user();
        return ( user_can($u,'administrator') || user_can($u,self::CAP_VIEW_PORTAL) || in_array('event_organizer',(array)$u->roles,true) );
    }
    private function meta_value($metaArr,$key){ return (isset($metaArr[$key]) && is_array($metaArr[$key]) && isset($metaArr[$key][0])) ? maybe_unserialize($metaArr[$key][0]) : ''; }
	/**
	 * Store city & province on the product so we can show/use them later.
	 */
	private function foop_tag_city_province($product_id, $city, $province){
		$product_id = (int) $product_id; if (!$product_id) return;
		$city     = sanitize_text_field($city ?? '');
		$province = sanitize_text_field($province ?? '');

		// Save as lightweight meta (keeps things simple and fast).
		update_post_meta($product_id, '_foop_city',     $city);
		update_post_meta($product_id, '_foop_province', $province);
	}
    private function parse_date_filters(){
        $from=isset($_GET[self::QV_FROM])?trim($_GET[self::QV_FROM]):''; $to=isset($_GET[self::QV_TO])?trim($_GET[self::QV_TO]):''; $quick=isset($_GET[self::QV_QUICK])?trim($_GET[self::QV_QUICK]):'';
        $from_norm=str_replace('/','-',$from); $to_norm=str_replace('/','-',$to);
        $from_ts=$to_ts=null;
        if($quick==='7' || $quick==='30'){ $days=intval($quick); $to_ts=current_time('timestamp'); $from_ts=strtotime('-'.$days.' days',$to_ts); $from_norm=date('Y-m-d',$from_ts); $to_norm=date('Y-m-d',$to_ts); }
        else {
            if(preg_match('/^\d{4}-\d{2}-\d{2}$/',$from_norm)) $from_ts=strtotime($from_norm.' 00:00:00');
            if(preg_match('/^\d{4}-\d{2}-\d{2}$/',$to_norm))   $to_ts=strtotime($to_norm.' 23:59:59');
        }
        if($from_ts && $to_ts && $from_ts>$to_ts){ $tmp=$from_ts;$from_ts=$to_ts;$to_ts=$tmp; $tmp=$from_norm;$from_norm=$to_norm;$to_norm=$tmp; }
        return array($from_ts,$to_ts,$from_norm,$to_norm,$quick);
    }

    private function get_events_for_user($user_id){
        $user_id=intval($user_id);
        $q=new WP_Query(array(
            'post_type'=>'product',
            'post_status'=>array('publish','private','draft','pending'),
            'posts_per_page'=>-1,
            'meta_query'=>array(array('key'=>self::PRODUCT_ORGANIZERS_META,'compare'=>'EXISTS'))
        ));
        $owned=array();
        if(!empty($q->posts)){
            foreach($q->posts as $p){
                $owners=get_post_meta($p->ID,self::PRODUCT_ORGANIZERS_META,true);
                if(!is_array($owners)) $owners=(array)$owners;
                $owners=array_map('intval',$owners);
                if( current_user_can('administrator') || in_array($user_id,$owners,true) ) $owned[]=$p;
            }
        }
        return $owned;
    }

    private function get_event_times($product_id){
        $start_date=get_post_meta($product_id,'WooCommerceEventsDate',true);
        $start_hour=get_post_meta($product_id,'WooCommerceEventsHour',true);
        $start_min =get_post_meta($product_id,'WooCommerceEventsMinutes',true);
        $end_date  =get_post_meta($product_id,'WooCommerceEventsEndDate',true);
        $end_hour  =get_post_meta($product_id,'WooCommerceEventsEndHour',true);
        $end_min   =get_post_meta($product_id,'WooCommerceEventsEndMinutes',true);
        $start_ts=$end_ts=null;
        if($start_date){ $h=($start_hour!=='')?intval($start_hour):0; $m=($start_min!=='')?intval($start_min):0; $start_ts=strtotime($start_date.' '.$h.':'.$m.':00'); }
        if($end_date){ $h=($end_hour!=='')?intval($end_hour):23; $m=($end_min!=='')?intval($end_min):59; $end_ts=strtotime($end_date.' '.$h.':'.$m.':59'); }
        elseif($start_ts){ $end_ts=strtotime(date('Y-m-d 23:59:59',$start_ts)); }
        return array($start_ts,$end_ts);
    }

    private function get_event_status($product_id){
        $post_status = get_post_status($product_id);
        if ($post_status === 'draft') return array('draft','Draft','grey');
        $cancelled=get_post_meta($product_id,'WooCommerceEventsCancelled',true);
        if($cancelled==='yes'||$cancelled==='1') return array('cancelled','Cancelled','red');
        list($start_ts,$end_ts)=$this->get_event_times($product_id);
        $now=current_time('timestamp');
        if($end_ts && $now>$end_ts) return array('passed','Passed','amber');
        if($start_ts && $now<$start_ts) return array('upcoming','Upcoming','green');
        if($start_ts && $end_ts && $now>=$start_ts && $now<=$end_ts) return array('ongoing','Ongoing','green');
        return array('upcoming','Upcoming','green');
    }


			/**
		 * Checkout page: show "Event Merchandise" upsell pulled from any event product(s) in the cart.
		 * Simple products get an AJAX "Add to cart" button; variables show "Choose options".
		 */
		public function render_checkout_merch_upsell(){
			if (!function_exists('is_checkout') || !is_checkout()) return;
			if (is_admin() && !wp_doing_ajax()) return;

			if (!WC()->cart) return;

			// 1) Collect event product IDs in cart
			$event_ids = array();
			foreach (WC()->cart->get_cart() as $item){
				$pid = isset($item['product_id']) ? (int)$item['product_id'] : 0;
				if ($pid && $this->sl_is_event_product($pid)) $event_ids[$pid] = $pid;
			}
			if (empty($event_ids)) return;

			// 2) Merge all merch linked to those events
			$merch = array();
			foreach ($event_ids as $eid){
				foreach ($this->get_event_merch_products($eid) as $m){
					$merch[$m->get_id()] = $m;
				}
			}
			if (empty($merch)) return;

			$ajax = admin_url('admin-ajax.php');
			$nonce = wp_create_nonce('foop_merch');

			echo '<div class="foop-card" id="foop-checkout-merch">';
			echo '<h3>Event merchandise</h3>';
			echo '<div class="foop-merch-note">Optional items — added to this order immediately.</div>';
			echo '<div class="foop-merch-grid">';
			foreach ($merch as $m){
				$mid   = $m->get_id();
				$name  = esc_html($m->get_name());
				$price = $m->get_price_html();

				echo '<div class="foop-merch-card">';
				echo '<h5>'.$name.'</h5>';
				echo '<div class="price">'.$price.'</div>';

				if ( $m->is_type('simple') && $m->is_purchasable() && $m->is_in_stock() ){
					echo '<button type="button" class="button foop-add-merch" data-pid="'.intval($mid).'">Add to cart</button>';
				} else {
					// Variables or unpurchasable → send to product page
					echo '<a href="'.esc_url($m->get_permalink()).'" class="button" target="_blank" rel="noopener">Choose options</a>';
				}
				echo '</div>';
			}
			echo '</div></div>';

			// Inline JS (only prints on checkout) — AJAX add + refresh totals
			echo '<script>(function($){
			  var nonce = "'.esc_js($nonce).'";
			  $(document).on("click",".foop-add-merch",function(e){
				e.preventDefault();
				var $btn=$(this), pid=$btn.data("pid");
				if(!pid) return;
				$btn.prop("disabled",true).text("Adding…");
				$.post("'.esc_url($ajax).'", {action:"foop_add_merch", pid:pid, nonce:nonce}, function(resp){
				  if(resp && resp.success){
					// Recalculate order review / totals
					$(document.body).trigger("update_checkout");
				  } else {
					alert((resp && resp.data) ? resp.data : "Could not add item.");
				  }
				}, "json").always(function(){ $btn.prop("disabled",false).text("Add to cart"); });
			  });
			})(jQuery);</script>';
		}
	
	/**
     * Save core FooEvents meta + location (supports Google Places lat/lng).
     * Falls back to "map_hint" (lat,lng string) for backward compatibility.
     */
    private function set_fooevents_meta($product_id, $span, $start_date, $start_time, $end_date){
        $tz  = wp_timezone();
        $tzs = function_exists('wp_timezone_string') ? wp_timezone_string() : get_option('timezone_string');
        $h = 0; $m = 0;
        if($start_time){ $parts = explode(':',$start_time); $h = intval($parts[0] ?? 0); $m = intval($parts[1] ?? 0); }
        $start_dt = date_create_from_format('Y-m-d H:i', trim($start_date.' '.sprintf('%02d:%02d',$h,$m)), $tz);
        $start_ts = $start_dt ? $start_dt->getTimestamp() : 0;

        $end_ts = 0;
        if($span === 'multi' && $end_date){
            $end_dt = date_create_from_format('Y-m-d H:i', trim($end_date.' 23:59'), $tz);
            $end_ts = $end_dt ? $end_dt->getTimestamp() : 0;
        }

        update_post_meta($product_id, 'WooCommerceEventsEvent', 'Event');
        update_post_meta($product_id, 'WooCommerceEvents', 'yes');
        update_post_meta($product_id, 'WooCommerceEventsType', ($span==='multi' && $end_ts) ? 'sequential' : 'single');

        if($start_ts){
            update_post_meta($product_id, 'WooCommerceEventsDate',                 date_i18n('F d, Y', $start_ts));
            update_post_meta($product_id, 'WooCommerceEventsDateMySQLFormat',      date_i18n('Y-m-d H:i:s', $start_ts));
            update_post_meta($product_id, 'WooCommerceEventsDateTimestamp',        $start_ts);
            update_post_meta($product_id, 'WooCommerceEventsDateTimeTimestamp',    $start_ts);
            update_post_meta($product_id, 'WooCommerceEventsHour',                 sprintf('%02d',$h));
            update_post_meta($product_id, 'WooCommerceEventsMinutes',              sprintf('%02d',$m));
            update_post_meta($product_id, 'WooCommerceEventsTimeZone',             $tzs ?: 'UTC');
        }

        if($end_ts){
            update_post_meta($product_id, 'WooCommerceEventsEndDate',              date_i18n('F d, Y', $end_ts));
            update_post_meta($product_id, 'WooCommerceEventsEndDateMySQLFormat',   date_i18n('Y-m-d H:i:s', $end_ts));
            update_post_meta($product_id, 'WooCommerceEventsEndDateTimestamp',     $end_ts);
            update_post_meta($product_id, 'WooCommerceEventsEndDateTimeTimestamp', $end_ts);
            update_post_meta($product_id, 'WooCommerceEventsHourEnd',              '23');
            update_post_meta($product_id, 'WooCommerceEventsMinutesEnd',           '59');
            $days = max(1, (int) floor(($end_ts - $start_ts) / DAY_IN_SECONDS) + 1);
            update_post_meta($product_id, 'WooCommerceEventsNumDays', $days);
        } else {
            update_post_meta($product_id, 'WooCommerceEventsNumDays', 1);
            delete_post_meta($product_id, 'WooCommerceEventsEndDate');
            update_post_meta($product_id, 'WooCommerceEventsHourEnd',    '23');
            update_post_meta($product_id, 'WooCommerceEventsMinutesEnd', '59');
        }

        // Venue name
        $venue = sanitize_text_field($_POST['venue_name'] ?? '');
        update_post_meta($product_id, 'WooCommerceEventsLocation', $venue);

        // Location coordinates: prefer explicit lat/lng from Places, else fallback to map_hint
        $lat = isset($_POST['map_lat']) ? (float) $_POST['map_lat'] : null;
        $lng = isset($_POST['map_lng']) ? (float) $_POST['map_lng'] : null;
        $hint = trim( (string) ($_POST['map_hint'] ?? '') );

        $coord = '';
        if ($lat !== null && $lng !== null && $lat !== 0.0 && $lng !== 0.0) {
            $coord = sprintf('%.6f,%.6f', $lat, $lng);
        } elseif ($hint !== '') {
            $coord = preg_replace('~\s+~','', $hint);
        }

        if($coord !== ''){
            // Save to all common FooEvents keys for maximum compatibility
            update_post_meta($product_id, 'WooCommerceEventsGPS',                 $coord);
            update_post_meta($product_id, 'WooCommerceEventsGoogleMaps',          $coord);
            update_post_meta($product_id, 'WooCommerceEventsGoogleCoordinates',   $coord);
        }

        update_post_meta($product_id, 'WooCommerceEventsEmail',          sanitize_email($_POST['email'] ?? ''));
        update_post_meta($product_id, 'WooCommerceEventsSupportContact', sanitize_text_field($_POST['phone'] ?? ''));
		
		// Website (normalize to https:// if missing)
		$event_website = trim((string)($_POST['website'] ?? ''));
		if ($event_website !== '' && !preg_match('~^https?://~i', $event_website)) {
			$event_website = 'https://' . $event_website;
		}
		update_post_meta($product_id, '_foop_org_website', esc_url_raw($event_website));
    }

    private function fmt_dt($ts){ if(!$ts) return '—'; $d=get_option('date_format'); $t=get_option('time_format'); return date_i18n($d.' '.$t,$ts); }
    private function human_attr_value($taxonomy,$value){ if(taxonomy_exists($taxonomy)){ $term=get_term_by('slug',$value,$taxonomy); if($term && !is_wp_error($term)) return $term->name; } return wc_clean($value); }
	

	/* ----------------------------------------
	 * CHUNK 4/8
     * ----------------------------------------- */
	
	
    /* -------------------------------------------------
     * Draft single view for owners (front end)
     * ------------------------------------------------- */
    public function maybe_allow_owner_view_draft($q){
        if(is_admin() || !$q->is_main_query()) return;
        if( $q->get('post_type')==='product' || is_post_type_archive('product') ){
            $q->set('post_status', array('publish','private','draft','pending'));
        }
    }
    public function restrict_draft_view_to_owner($posts, $q){
        if(is_admin() || !$q->is_main_query()) return $posts;
        if(empty($posts)) return $posts;
        if( count($posts)===1 && isset($posts[0]) && $posts[0] instanceof WP_Post && $posts[0]->post_type==='product'){
            $p = $posts[0];
            if($p->post_status==='draft'){
                if( !is_user_logged_in() ) return array();
                if( !($this->user_owns_event(get_current_user_id(), $p->ID) || current_user_can('administrator')) ) return array();
            }
        }
        return $posts;
    }

    public function enqueue_single_product_org_css(){
        if (!function_exists('is_product') || !is_product()) return;
        wp_register_style('sl-org-badge', false);
        wp_enqueue_style('sl-org-badge');
        $css = '
        .sl-org-badge{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border:1px solid #e5e7eb;background:#fff;border-radius:12px}
        .sl-org-avatar{width:48px;height:48px;border-radius:9999px;object-fit:cover;display:block}
        .sl-org-meta{display:flex;flex-direction:column;line-height:1.2}
        .sl-org-by{font-size:12px;color:#6b7280}
        .sl-org-name{font-size:14px;font-weight:700}
		/* --- Event Merchandise block --- */
		
		#foop-event-merch{margin-top:14px}
		.foop-merch-grid{display:grid;grid-template-columns:repeat( auto-fill, minmax(220px,1fr) );gap:10px}
		.foop-merch-card{border:1px solid #e5e7eb;border-radius:12px;background:#fff;padding:.75rem}
		.foop-merch-card h5{margin:.1rem 0 .35rem;font-size:14px}
		.foop-merch-card .price{font-weight:700;margin:.15rem 0}
		.foop-merch-note{font-size:12px;color:#6b7280;margin:-2px 0 .5rem}
        ';
        wp_add_inline_style('sl-org-badge', $css);
    }

	/**
	 * Output the city under product titles on archive/listing cards.
	 */
	public function foop_output_city_below_venue(){
		if (!function_exists('is_product') && !function_exists('woocommerce_template_loop_product_title')) {
			// Not on a Woo listing; bail quietly
		}
		global $product;
		if (!($product instanceof WC_Product)) return;

		$pid  = $product->get_id();
		$city = get_post_meta($pid, '_foop_city', true);
		if (!$city) return;

		echo '<div class="foop-city" style="font-size:12px;color:#6b7280;margin-top:2px">'.esc_html($city).'</div>';
	}
	
    /* -------------------------------------------------
     * Dashboard (table + filters + search + pagination)
     * ------------------------------------------------- */
    private function render_dashboard_html(){
        list($from_ts,$to_ts,$from_str,$to_str,$quick)=$this->parse_date_filters();
        $user_id=get_current_user_id(); $events=$this->get_events_for_user($user_id);
        $filter_event  = isset($_GET[self::QV_EVENT]) ? intval($_GET[self::QV_EVENT]) : 0;
        $filter_status = isset($_GET[self::QV_STATUS]) ? sanitize_text_field($_GET[self::QV_STATUS]) : 'all';

        if($from_ts||$to_ts||$filter_event||($filter_status && $filter_status!=='all')){
            $filtered=array();
            foreach($events as $p){
                if($filter_event && intval($p->ID)!==$filter_event) continue;
                list($start_ts,$end_ts)=$this->get_event_times($p->ID);
                if(($from_ts||$to_ts) && !$start_ts) continue;
                if($from_ts && $start_ts<$from_ts) continue;
                if($to_ts && $start_ts>$to_ts) continue;
                if($filter_status && $filter_status!=='all'){
                    list($key)= $this->get_event_status($p->ID);
                    if($key!==$filter_status) continue;
                }
                $filtered[]=$p;
            }
            $events=$filtered;
        }

        /* --- search + per-page + pagination --- */
        $search = isset($_GET[self::QV_SEARCH]) ? sanitize_text_field($_GET[self::QV_SEARCH]) : '';
        $per    = isset($_GET[self::QV_PER_PAGE]) ? intval($_GET[self::QV_PER_PAGE]) : 10;
        $per    = in_array($per, array(10,50), true) ? $per : 10;
        $page   = isset($_GET[self::QV_PAGE]) ? max(1, intval($_GET[self::QV_PAGE])) : 1;

        if ($search !== '') {
            $q = strtolower($search);
            $events = array_values(array_filter($events, function($p) use($q){
                $title = get_the_title( is_object($p) ? $p->ID : $p );
                return (stripos($title, $q) !== false);
            }));
        }

        $total  = count($events);
        $pages  = max(1, (int)ceil($total / $per));
        $page   = min($page, $pages);
        $offset = ($page - 1) * $per;
        $events_page = array_slice($events, $offset, $per);

        // Precompute total entries across ALL filtered events (for summary)
        $tickets_all_total = 0;
        foreach($events as $p_sum){
            $tickets_all_total += $this->get_ticket_count_for_product($p_sum->ID,$from_ts,$to_ts);
        }

        ob_start();
        echo '<div class="foop-wrap">';
		echo '<div class="foop-summary" style="display:flex;justify-content:space-between;align-items:center">';
		echo   '<span>Events for: <em>'.esc_html(wp_get_current_user()->display_name).'</em>.</span>';
		echo   '<a href="#" class="btn" data-toggle-filters aria-expanded="true" aria-controls="foop-filters">Hide filters</a>';
		echo '</div>';

        // Filters
		echo '<form id="foop-filters" class="foop-filters" method="get">';
        echo '<input type="hidden" name="'.esc_attr(self::QV_TAB).'" value="dashboard">';
        echo '<label>From <input type="date" name="'.esc_attr(self::QV_FROM).'" value="'.esc_attr($from_str).'" placeholder="yyyy-mm-dd"></label>';
        echo '<label>To <input type="date" name="'.esc_attr(self::QV_TO).'" value="'.esc_attr($to_str).'" placeholder="yyyy-mm-dd"></label>';
        $base_url = remove_query_arg(array(self::QV_QUICK));
        $q7  = add_query_arg(array(self::QV_QUICK=>'7'), $base_url);
        $q30 = add_query_arg(array(self::QV_QUICK=>'30'), $base_url);
        echo '<a class="btn'.(($quick==='7')?' active':'').'" href="'.esc_url($q7).'">Last 7 days</a>';
        echo '<a class="btn'.(($quick==='30')?' active':'').'" href="'.esc_url($q30).'">Last 30 days</a>';
        echo '<label>Event <select name="'.esc_attr(self::QV_EVENT).'"><option value="0">'.esc_html__('All events','slop').'</option>';
        foreach($this->get_events_for_user($user_id) as $ep){
            $sel = ($filter_event && intval($ep->ID)===$filter_event) ? 'selected' : '';
            echo '<option value="'.intval($ep->ID).'" '.$sel.'>'.esc_html(get_the_title($ep)).'</option>';
        }
        echo '</select></label>';
        $statuses = array(
            'all'       => 'All statuses',
            'draft'     => 'Draft',
            'upcoming'  => 'Upcoming',
            'ongoing'   => 'Ongoing',
            'passed'    => 'Passed',
            'cancelled' => 'Cancelled'
        );
        echo '<label>Status <select name="'.esc_attr(self::QV_STATUS).'">';
        foreach($statuses as $k=>$lab){
            $sel = ($filter_status===$k)?'selected':'';
            echo '<option value="'.esc_attr($k).'" '.$sel.'>'.esc_html($lab).'</option>';
        }
        echo '</select></label>';

        // Search + per-page + reset page=1 on Apply
        echo '<label>Search <input type="search" name="'.esc_attr(self::QV_SEARCH).'" value="'.esc_attr($search).'" placeholder="Event name…"></label>';
        echo '<label>Show <select name="'.esc_attr(self::QV_PER_PAGE).'">'
            .'<option value="10"'.selected($per,10,false).'>10 per page</option>'
            .'<option value="50"'.selected($per,50,false).'>50 per page</option>'
            .'</select></label>';
        echo '<input type="hidden" name="'.esc_attr(self::QV_PAGE).'" value="1">';

        if(get_query_var('organizer',null)!==null) echo '<input type="hidden" name="organizer" value="">';
        echo '<a class="btn btn-primary" href="#" onclick="this.closest(\'form\').submit();return false;">'.esc_html__('Apply','slop').'</a> ';
        $clear_url=remove_query_arg(array(self::QV_FROM,self::QV_TO,self::QV_QUICK,self::QV_EVENT,self::QV_STATUS,self::QV_SEARCH,self::QV_PER_PAGE,self::QV_PAGE));
        echo '<a class="btn" href="'.esc_url($clear_url).'">'.esc_html__('Clear','slop').'</a>';
        echo '</form>';

        if(empty($events)){ echo '<p>No events match your filters.</p>'; echo '</div>'; return ob_get_clean(); }

        // Totals across filtered set
        $product_ids=array_map(function($p){ return intval($p->ID); }, $events);
        $totals=$this->get_sales_for_products($product_ids,$from_ts,$to_ts);

        // Table
        echo '<div class="foop-table-wrap"><table class="foop-table"><thead><tr>
<th>Event</th><th>Category</th><th>Date</th><th>Status</th><th>Entries</th><th>Orders</th><th>Total revenue</th><th>Actions</th>
</tr></thead><tbody>';

        $tickets_all = 0;
        foreach($events_page as $p){
            $product = wc_get_product($p->ID); if(!$product) continue;

            list($status_key,$status_label,$color) = $this->get_event_status($p->ID);
            list($start_ts,$end_ts)               = $this->get_event_times($p->ID);

            $start_html = ($start_ts ? esc_html( date_i18n( get_option('date_format'), $start_ts ) ) : '—');

            $status_html = ($status_key === 'draft')
                ? '<span class="foop-badge-draft">Draft</span>'
                : '<span class="foop-dot '.$color.'"></span>';

            $entries     = $this->get_ticket_count_for_product($p->ID,$from_ts,$to_ts); $tickets_all += $entries;
            $row_totals  = $this->get_sales_for_products(array($p->ID),$from_ts,$to_ts);
            $total_rev   = $row_totals['gross'];

            $cats = wp_get_post_terms($p->ID,'product_cat', array('fields'=>'all'));
            $cat_label = '—';
            if(!is_wp_error($cats) && !empty($cats)){
                foreach($cats as $t){
                    if($t->slug !== $this->merch_category_slug){ $cat_label = $t->name; break; }
                }
            }

            $export_url  = add_query_arg(array('action'=>'foop_export_participants','event_id'=>intval($p->ID),'nonce'=>wp_create_nonce('foop_export_'.intval($p->ID))), admin_url('admin-ajax.php'));
            if($from_str) $export_url = add_query_arg(self::QV_FROM,$from_str,$export_url);
            if($to_str)   $export_url = add_query_arg(self::QV_TO,$to_str,$export_url);

            $event_title = $product->get_name();

            $actions = array();
            $actions[] = '<a href="'.esc_url(get_permalink($p)).'" target="_blank" rel="noopener">View</a>';
            $actions[] = '<a class="foop-breakdown" href="#" data-event="'.intval($p->ID).'">Breakdown</a>';
            $actions[] = '<a class="foop-export" href="'.esc_url($export_url).'">Export CSV</a>';

            if($status_key==='draft'){
                $edit_url = add_query_arg(array(self::QV_TAB=>'create','edit'=>intval($p->ID)), $this->portal_page_url());
                $actions[] = '<a href="'.esc_url($edit_url).'">Edit</a>';
            } else {
                $actions[] = '<a class="foop-request-change" href="#" data-event="'.intval($p->ID).'">Request change</a>';
            }

            echo '<tr>';
            echo '<td data-label="Event"><a title="'.esc_attr($event_title).'" href="'.esc_url(get_permalink($p)).'" target="_blank">'.esc_html($event_title).'</a></td>';
            echo '<td data-label="Category">'.esc_html($cat_label).'</td>';
            echo '<td data-label="Date">'.$start_html.'</td>';
            echo '<td data-label="Status" class="foop-td-status">'.$status_html.'</td>';
            echo '<td data-label="Entries"><span class="foop-badge">'.intval($entries).'</span></td>';
            echo '<td data-label="Orders">'.intval($row_totals['orders']).'</td>';
            echo '<td data-label="Total revenue"><strong>'.wc_price($total_rev).'</strong></td>';
            echo '<td data-label="Actions" class="foop-actions">'.implode(' &nbsp; ',$actions).'</td>';
            echo '</tr>';

            $breakdown = $this->render_variation_breakdown_table($p->ID,$from_ts,$to_ts);
            echo '<script type="text/template" id="foop-vars-'.intval($p->ID).'">'.$breakdown.'</script>';
        }
        echo '</tbody></table></div>';

        // Pagination footer
        $first = ($total === 0) ? 0 : ($offset + 1);
        $last  = min($offset + $per, $total);
        $base_url_pager = remove_query_arg(self::QV_PAGE);
        echo '<div class="foop-pager">';
          echo '<div class="foop-pager__summary">Showing '.esc_html($first).'–'.esc_html($last).' of '.esc_html($total).'</div>';
          echo '<nav class="foop-pager__links">';
            if ($page > 1) {
              echo '<a class="btn" href="'.esc_url( add_query_arg(self::QV_PAGE, $page-1, $base_url_pager) ).'">&laquo; Prev</a>';
            }
            $start = max(1, $page - 2);
            $end   = min($pages, $page + 2);
            for ($pnum = $start; $pnum <= $end; $pnum++) {
              $cls = ($pnum === $page) ? 'btn is-active' : 'btn';
              echo '<a class="'.$cls.'" href="'.esc_url( add_query_arg(self::QV_PAGE, $pnum, $base_url_pager) ).'">'.esc_html($pnum).'</a>';
            }
            if ($page < $pages) {
              echo '<a class="btn" href="'.esc_url( add_query_arg(self::QV_PAGE, $page+1, $base_url_pager) ).'">Next &raquo;</a>';
            }
          echo '</nav>';
        echo '</div>';

        echo '<div class="foop-summary"><strong>Filtered events — summary:</strong> Entries: ~'.intval($tickets_all_total).' • Orders: '.intval($totals['orders']).' • Total revenue: <strong>'.wc_price($totals['gross']).'</strong></div>';
        return ob_get_clean();
    }


	/* ----------------------------------------
	 * CHUNK 5/8
     * ----------------------------------------- */
	
	
    /* -------------------------------------------------
     * Profile (new tab)
     * ------------------------------------------------- */
    private function get_profile_defaults(){
        $u = wp_get_current_user();
        return array(
            'first_name' => $u->first_name,
            'last_name'  => $u->last_name,
            'email'      => $u->user_email,
            'phone'      => get_user_meta($u->ID,'foop_phone',true),
            'company'    => get_user_meta($u->ID,'foop_company',true),
            'website'    => $u->user_url,
            'addr1'      => get_user_meta($u->ID,'foop_addr1',true),
            'addr2'      => get_user_meta($u->ID,'foop_addr2',true),
            'city'       => get_user_meta($u->ID,'foop_city',true),
            'province'   => get_user_meta($u->ID,'foop_province',true),
            'vat'        => get_user_meta($u->ID,'foop_vat',true),
        );
    }

    private function foop_default_caf_array(){
        return array(
            array('label'=>'ID Number',          'type'=>'alphanumeric','options'=>'','default'=>'','required'=>'yes','uid'=>'caf_'.wp_generate_password(12,false)),
            array('label'=>'Medical Aid',        'type'=>'text',        'options'=>'','default'=>'','required'=>'no', 'uid'=>'caf_'.wp_generate_password(12,false)),
            array('label'=>'Medical Aid Number', 'type'=>'alphanumeric','options'=>'','default'=>'','required'=>'no', 'uid'=>'caf_'.wp_generate_password(12,false)),
            array('label'=>'Medical Conditions', 'type'=>'textarea',    'options'=>'','default'=>'','required'=>'no', 'uid'=>'caf_'.wp_generate_password(12,false)),
        );
    }
    private function foop_ensure_caf_present($product_id){
        if (get_post_type($product_id) !== 'product') return;
        $is_event = ( get_post_meta($product_id,'WooCommerceEvents',true) === 'yes'
                   || get_post_meta($product_id,'WooCommerceEventsType',true)
                   || get_post_meta($product_id,'WooCommerceEventsDate',true) );
        if (!$is_event) return;
        $raw  = get_post_meta($product_id,'WooCommerceEventsCustomAttendeeFields',     true);
        $json = get_post_meta($product_id,'WooCommerceEventsCustomAttendeeFieldsJSON', true);
        if ( !empty($raw) || !empty($json) ) return;
        $fields = $this->foop_default_caf_array();
        update_post_meta($product_id,'WooCommerceEventsCustomAttendeeFields',     $fields);
        update_post_meta($product_id,'WooCommerceEventsCustomAttendeeFieldsJSON', wp_json_encode($fields));
    }
    public function caf_backfill_after_wc_save($product){
        if ($product instanceof WC_Product) { $this->foop_ensure_caf_present($product->get_id()); }
    }
    public function caf_backfill_on_shutdown(){
        if (!is_admin()) return;
        $post_id = isset($_POST['post_ID']) ? intval($_POST['post_ID']) : 0;
        if ($post_id) { $this->foop_ensure_caf_present($post_id); }
    }

    private function render_profile_form($errors=array(),$success=array()){
        $p = $this->get_profile_defaults();
        ob_start();
        echo '<div class="foop-card"><h3>Your profile</h3>';
        if(!empty($errors)){ echo '<div class="foop-card" style="border-color:#d63638;color:#d63638"><ul><li>'.implode('</li><li>',array_map('esc_html',$errors)).'</li></ul></div>'; }
        if(!empty($success)){ echo '<div class="foop-card" style="border-color:#46b450;color:#155724"><ul><li>'.implode('</li><li>',array_map('esc_html',$success)).'</li></ul></div>'; }

        echo '<form method="post" class="foop-card foop-profile-form" enctype="multipart/form-data">';
        wp_nonce_field('foop_save_profile','foop_profile_nonce');
        echo '<input type="hidden" name="foop_action" value="save_profile">';
        echo '<div class="foop-form-row">';

        // Organiser logo (profile)
        $u        = wp_get_current_user();
        $logo_id  = (int) get_user_meta($u->ID, 'foop_org_logo_id', true);
        $logo_img = $logo_id ? wp_get_attachment_image(
            $logo_id,
            'thumbnail',
            false,
            array('style' => 'width:64px;height:64px;border-radius:8px;object-fit:cover;display:block')
        ) : '';

        echo '<div style="grid-column:1/-1;margin:0 0 .75rem">';
        echo '<label>Organiser logo</label>';
        if ($logo_img) {
            echo '<div style="display:flex;gap:10px;align-items:center;margin:.25rem 0">'
                . $logo_img
                . '<label style="font-weight:normal"><input type="checkbox" name="remove_org_logo" value="1"> Remove current logo</label>'
                . '</div>';
        }
        echo '<input type="file" name="org_logo" accept="image/*">';
        echo '<div class="help">Square works best; 256×256 or larger.</div>';
        echo '</div>';

        echo '<div><label>Organiser company name</label><input type="text" name="company" value="'.esc_attr($p['company']).'"></div>';
		echo '<div><label>Website *</label>
		  <input type="url" name="website" value="'.esc_attr($p['website']).'" placeholder="https://your-site.com" inputmode="url">
		  <span class="help">Tip: include https:// e.g. https://your-site.com</span>
		</div>';
        echo '<div><label>Contact first name</label><input type="text" name="first_name" value="'.esc_attr($p['first_name']).'"></div>';
        echo '<div><label>Contact last name</label><input type="text" name="last_name" value="'.esc_attr($p['last_name']).'"></div>';
        echo '<div><label>Telephone</label><input type="text" name="phone" value="'.esc_attr($p['phone']).'"></div>';
        echo '<div><label>Email</label><input type="email" name="email" value="'.esc_attr($p['email']).'"></div>';
        echo '<div><label>Address line 1</label><input type="text" name="addr1" value="'.esc_attr($p['addr1']).'"></div>';
        echo '<div><label>Address line 2</label><input type="text" name="addr2" value="'.esc_attr($p['addr2']).'"></div>';
        echo '<div><label>City</label><input type="text" name="city" value="'.esc_attr($p['city']).'"></div>';
        echo '<div><label>Province</label><input type="text" name="province" value="'.esc_attr($p['province']).'"></div>';
        echo '<div><label>VAT number</label><input type="text" name="vat" value="'.esc_attr($p['vat']).'"></div>';
        echo '</div>';

        echo '<h4>Change password</h4>';
        echo '<div class="foop-form-row">';
        echo '<div><label>New password</label><input type="password" name="new_pass"></div>';
        echo '<div><label>Confirm password</label><input type="password" name="new_pass2"></div>';
        echo '</div></div>';
        echo '<p><button type="submit" class="foop-btn">Save profile</button></p>';
        echo '</form></div>';
        return ob_get_clean();
    }

    public function maybe_handle_profile_submit(){
        if(!isset($_POST['foop_action']) || $_POST['foop_action']!=='save_profile') return;
        if(!isset($_POST['foop_profile_nonce']) || !wp_verify_nonce($_POST['foop_profile_nonce'],'foop_save_profile')) return;
        if(!is_user_logged_in()) return;

        $u = wp_get_current_user();
        $errs=array(); $ok=array();

        $email = sanitize_email($_POST['email'] ?? '');
        if($email && $email!==$u->user_email){
            if(!is_email($email)) $errs[]='Please enter a valid email address.';
            elseif( email_exists($email) ) $errs[]='That email is already in use.';
        }

        $pass1 = (string)($_POST['new_pass'] ?? '');
        $pass2 = (string)($_POST['new_pass2'] ?? '');
        if($pass1!=='' || $pass2!==''){
            if($pass1!==$pass2) $errs[]='Passwords do not match.';
            if(strlen($pass1)<8) $errs[]='Password must be at least 8 characters.';
        }

        if(empty($errs)){
            $update = array('ID'=>$u->ID);
            if($email && $email!==$u->user_email) $update['user_email']=$email;
            $update['first_name']=sanitize_text_field($_POST['first_name'] ?? '');
            $update['last_name']=sanitize_text_field($_POST['last_name'] ?? '');
            $update['display_name']=trim(($update['first_name'] ?? $u->first_name).' '.($update['last_name'] ?? $u->last_name));
			$website = trim((string)($_POST['website'] ?? ''));
			if ($website !== '' && !preg_match('~^https?://~i', $website)) {
				$website = 'https://' . $website;
			}
			$update['user_url'] = esc_url_raw($website);
            if(!empty($pass1)) $update['user_pass']=$pass1;
            wp_update_user($update);

            update_user_meta($u->ID,'foop_company',sanitize_text_field($_POST['company'] ?? ''));
            update_user_meta($u->ID,'foop_phone',sanitize_text_field($_POST['phone'] ?? ''));
            update_user_meta($u->ID,'foop_addr1',sanitize_text_field($_POST['addr1'] ?? ''));
            update_user_meta($u->ID,'foop_addr2',sanitize_text_field($_POST['addr2'] ?? ''));
            update_user_meta($u->ID,'foop_city',sanitize_text_field($_POST['city'] ?? ''));
            update_user_meta($u->ID,'foop_province',sanitize_text_field($_POST['province'] ?? ''));
            update_user_meta($u->ID,'foop_vat',sanitize_text_field($_POST['vat'] ?? ''));

            // Handle organiser logo upload/removal
            if (isset($_POST['remove_org_logo']) && $_POST['remove_org_logo'] === '1') {
                delete_user_meta($u->ID, 'foop_org_logo_id');
            }

            if (!empty($_FILES['org_logo']['name'])) {
                require_once ABSPATH.'wp-admin/includes/file.php';
                require_once ABSPATH.'wp-admin/includes/media.php';
                require_once ABSPATH.'wp-admin/includes/image.php';

                $att = media_handle_upload('org_logo', 0);
                if (!is_wp_error($att)) {
                    update_user_meta($u->ID, 'foop_org_logo_id', (int) $att);
                } else {
                    $errs[] = 'Logo upload failed.';
                }
            }
            $ok[]='Profile saved.';
            if(!empty($pass1)){ wp_set_auth_cookie($u->ID,true); $ok[]='Password updated.'; }
        }

        add_filter('the_content', function($c) use($errs,$ok){ return $this->render_portal_html('profile',$errs,$ok); });
    }

    public function render_organizer_badge_under_image(){
        if ( ! function_exists('is_product') || ! is_product() ) return;
        if ( ! function_exists('wc_get_product') ) return;

        global $product;
        if ( ! ($product instanceof WC_Product) ) return;

        $pid = $product->get_id();

        // Only for events
        if ( get_post_meta($pid, 'WooCommerceEvents', true) !== 'yes'
          && ! get_post_meta($pid, 'WooCommerceEventsDate', true)
          && ! get_post_meta($pid, 'WooCommerceEventsType', true) ) {
            return;
        }

        // First organiser on the product
        $owners = (array) get_post_meta($pid, self::PRODUCT_ORGANIZERS_META, true);
        $owners = array_values(array_filter(array_map('intval', $owners)));
        if ( empty($owners) ) return;

        $uid = $owners[0];

        // Preferred display: company, else WP display_name
        $display = get_user_meta($uid, 'foop_company', true);
        if ( $display === '' ) {
            $u = get_userdata($uid);
            $display = $u ? $u->display_name : '';
        }

        // Logo (profile upload) → fallback to avatar
        $logo_id  = (int) get_user_meta($uid, 'foop_org_logo_id', true);
        $img_html = '';

        if ( $logo_id ) {
            $img_html = wp_get_attachment_image(
                $logo_id,
                'thumbnail',
                false,
                array(
                    'class'   => 'sl-org-avatar',
                    'alt'     => $display ? $display.' logo' : 'Organiser logo',
                    'loading' => 'lazy'
                )
            );
        }
        if ( $img_html === '' ) {
            $img_html = get_avatar(
                $uid,
                96,
                '',
                $display,
                array('class' => 'sl-org-avatar', 'loading' => 'lazy')
            );
        }

        echo '<div class="sl-org-badge" role="note" aria-label="Organiser">';
            echo $img_html;
            echo '<div class="sl-org-meta">';
                echo '<span class="sl-org-by">Organised by</span>';
                echo '<span class="sl-org-name">'.esc_html($display).'</span>';
            echo '</div>';
        echo '</div>';
    }

		/**
	 * Return merch products linked to an event via cross-sells (and not themselves events).
	 */
	private function get_event_merch_products($event_id){
		$event = wc_get_product($event_id);
		if (!$event) return array();
		$ids = array_map('intval', (array)$event->get_cross_sell_ids());
		if (empty($ids)) return array();
		$out = array();
		foreach ($ids as $id){
			$p = wc_get_product($id);
			if (!$p) continue;
			if ($p->get_status() !== 'publish') continue;
			// Don’t surface other events here
			if ($this->sl_is_event_product($id)) continue;
			$out[$id] = $p;
		}
		return array_values($out);
	}

	/**
	 * Single product: print a neat "Event merchandise" block under the map/summary.
	 */
	public function render_event_merch_under_map(){
		if (!function_exists('is_product') || !is_product()) return;
		global $product;
		if (!($product instanceof WC_Product)) return;

		$pid = $product->get_id();
		if (!$this->sl_is_event_product($pid)) return;

		$merch = $this->get_event_merch_products($pid);
		if (empty($merch)) return;

		echo '<div class="foop-card" id="foop-event-merch">';
		echo '<h4>Event merchandise</h4>';
		echo '<div class="foop-merch-note">(Available during checkout)</div>';
		echo '<div class="foop-merch-grid">';
		foreach ($merch as $m){
			$name  = esc_html($m->get_name());
			$price = $m->get_price_html(); // includes currency HTML
			echo '<div class="foop-merch-card">';
			$thumb = $m->get_image('woocommerce_thumbnail', array(
			  'style'=>'width:100%;height:auto;border-radius:8px;margin-bottom:.35rem'
			));
			echo $thumb;
			echo '<h5>'.$name.'</h5>';
			echo '<div class="price">'.$price.'</div>';
			// No add button here (single page text says available during checkout)
			echo '</div>';
		}
		echo '</div></div>';
	}
	
	/**
 * Collect valid cross-sell products for an event product.
 */
private function get_event_merch_products_for( $product_id ) {
    if ( ! function_exists( 'wc_get_product' ) ) return array();
    $p = wc_get_product( $product_id ); if ( ! $p ) return array();
    $ids = array_map( 'intval', (array) $p->get_cross_sell_ids() );
    if ( empty( $ids ) ) return array();

    $out = array();
    foreach ( $ids as $mid ) {
        $m = wc_get_product( $mid );
        if ( ! $m ) continue;
        if ( 'publish' !== get_post_status( $mid ) ) continue;
        if ( ! $m->is_purchasable() ) continue;
        $out[] = $m;
    }
    return $out;
}

/**
 * Single product block: "Event Merchandise"
 */
public function render_event_merch_block() {
    if ( ! function_exists( 'is_product' ) || ! is_product() ) return;
    global $product; if ( ! $product ) return;

    $pid = $product->get_id();
    if ( ! $this->sl_is_event_product( $pid ) ) return;

    $merch = $this->get_event_merch_products_for( $pid );
    if ( empty( $merch ) ) return;

    // Base styles + product-page overrides (no borders, no buttons)
    echo '<style>
      .sl-merch{margin:1rem 0;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
      .sl-merch h3{margin:.9rem 1rem}
      .sl-merch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;padding:0 1rem 1rem}
      .sl-merch-card{border:1px solid #eee;border-radius:10px;padding:.75rem;background:#fff;display:flex;flex-direction:column}
      .sl-merch-card h4{font-size:14px;margin:.35rem 0}
      .sl-price{font-weight:700;margin:.25rem 0}
      .sl-merch-thumb{width:100%;height:auto;border-radius:8px;margin-bottom:.35rem}

      /* --- product page overrides --- */
      .sl-merch--product{border:0;background:transparent}
      .sl-merch--product h3{margin:.5rem 0 1rem}
      .sl-merch--product .sl-merch-grid{padding:0}
      .sl-merch--product .sl-merch-card{border:0;box-shadow:none;padding:0;background:transparent}
      .sl-merch--product .sl-add{display:none}
    </style>';

    echo '<div class="sl-merch sl-merch--product">';
    echo '<h3>Event Merchandise <small style="font-weight:400;color:#6b7280">(Available during checkout)</small></h3>';
    echo '<div class="sl-merch-grid">';

    foreach ( $merch as $m ) {
        $thumb = $m->get_image( 'woocommerce_thumbnail', array( 'class' => 'sl-merch-thumb' ) );
        echo '<div class="sl-merch-card">';
          echo $thumb;
          echo '<h4>'.esc_html( $m->get_name() ).'</h4>';
          echo '<div class="sl-price">'.wp_kses_post( $m->get_price_html() ).'</div>';
          // Intentionally no add-to-cart on product page (only at checkout)
        echo '</div>';
    }

    echo '</div></div>';
}

		/**
		 * Checkout side-block showing any merch cross-sells for event items in cart.
		 */
		public function render_checkout_merch_block() {
			if ( ! function_exists( 'WC' ) ) return;

			// Event products in cart
			$event_ids = array();
			foreach ( WC()->cart->get_cart() as $line ) {
				$pid = (int) ( $line['product_id'] ?? 0 );
				if ( $pid && $this->sl_is_event_product( $pid ) ) $event_ids[$pid] = $pid;
			}
			if ( empty( $event_ids ) ) return;

			// Merge merch for those events
			$merch = array();
			foreach ( $event_ids as $pid ) {
				foreach ( $this->get_event_merch_products_for( $pid ) as $m ) {
					$merch[ $m->get_id() ] = $m;
				}
			}
			if ( empty( $merch ) ) return;

			echo '<div class="sl-merch" style="margin:0 0 1rem;border:1px solid #e5e7eb;border-radius:12px;background:#fff">';
			echo '<h3 style="margin:.9rem 1rem">Add Merchandise <small style="font-weight:400;color:#6b7280">(will update your total)</small></h3>';
			echo '<div class="sl-merch-grid" style="padding:0 1rem 1rem">';

			foreach ( $merch as $m ) {
				$mid   = $m->get_id();
				$thumb = $m->get_image( 'woocommerce_thumbnail', array( 'class' => 'sl-merch-thumb' ) );
				echo '<div class="sl-merch-card">';
					echo $thumb;
					echo '<h4>' . esc_html( $m->get_name() ) . '</h4>';
					echo '<div class="sl-price">' . wp_kses_post( $m->get_price_html() ) . '</div>';
					echo '<p class="sl--add">
							<a href="#"
							   class="button alt"
							   data-sl-merch-open
							   data-product-id="' . esc_attr( $mid ) . '"
							   data-product-type="' . esc_attr( $m->get_type() ) . '">
							   Add to order
							</a>
						  </p>';
				echo '</div>';
			}

			echo '</div></div>';

		}

		/**
		 * If user adds merch while on checkout, stay on checkout.
		 */
		public function stay_on_checkout_after_add( $url ) {
			if ( function_exists('is_checkout') && is_checkout() ) return wc_get_checkout_url();
			return $url;
		}

	public function login_redirect_to_portal( $redirect, $user ) {
    if (!($user instanceof \WP_User)) return $redirect;
    if (user_can($user, 'administrator')) return $redirect;

    if (in_array('event_organizer', (array) $user->roles, true) || user_can($user, self::CAP_VIEW_PORTAL)) {
        $dest = $this->portal_page_url();
        if ($dest) return $dest;
    }
    return $redirect;
}

		public function redirect_organizer_from_my_account() {
			if (!is_user_logged_in() || is_admin() || wp_doing_ajax()) return;
			if (!function_exists('is_account_page') || !is_account_page()) return;

			// Skip other endpoints inside My Account
			if (function_exists('is_wc_endpoint_url')) {
				$skip = ['orders','view-order','downloads','edit-address','payment-methods','edit-account',
						 'lost-password','customer-logout','order-pay','order-received'];
				foreach ($skip as $ep) { if (is_wc_endpoint_url($ep)) return; }
			}

			if ($this->current_user_is_organizer_like() && !current_user_can('administrator')) {
				$dest = $this->portal_page_url();
				if ($dest) { wp_safe_redirect($dest, 302); exit; }
			}
		}
	
    /* -------------------------------------------------
     * Create / Edit Event form
     * ------------------------------------------------- */
    private function render_create_event_form($errors=array(), $success=array()){
        $is_edit = isset($_GET['edit']) ? intval($_GET['edit']) : 0;
        $editing = ($is_edit && $this->user_owns_event(get_current_user_id(),$is_edit) && get_post_status($is_edit)==='draft');

        // Current thumbnail (when editing)
        $thumb_html = '';
        if ( $editing ) {
            $thumb_id = get_post_thumbnail_id( $is_edit );
            if ( $thumb_id ) {
                $thumb_html = wp_get_attachment_image( $thumb_id, 'thumbnail', false, array(
                    'class' => 'foop-thumb',
                    'alt'   => 'Current image',
                    'loading' => 'lazy',
                ));
            }
        }
        $profile = $this->get_profile_defaults();
		// Back-compat: some echoes below still referenced $p from the profile form.
		$p = $profile;

        // Prefill
        $pref = array(
            'event_name'   => '',
            'event_span'   => 'single',
            'start_date'   => '',
            'end_date'     => '',
            'start_time'   => '',
            'license_required' => 'no',
            'license_details'  => '',
            // Address defaults from profile
            'addr1' => $profile['addr1'], 'addr2' => $profile['addr2'], 'city'=>$profile['city'], 'province'=>$profile['province'],
            // Google Places (autocomplete) + coords
            'place_search' => '',
            'lat'          => '',
            'lng'          => '',
            'extra_info'   => '',
            'event_category' => '',
            'venue_name'   => '',
			'temp_license_fee' => '',
        );

        if ($editing) {
            $pref['event_name'] = get_the_title($is_edit);
			$pref['temp_license_fee'] = get_post_meta($is_edit, '_sl_temp_license_fee', true);

            // Dates
            $start_mysql = (string) get_post_meta($is_edit, 'WooCommerceEventsDateMySQLFormat', true);
            if ($start_mysql === '') {
                $start_h = (string) get_post_meta($is_edit, 'WooCommerceEventsDate', true);
                if ($start_h !== '') { $start_mysql = date('Y-m-d', strtotime($start_h)); }
            }
            $pref['start_date'] = $start_mysql ? substr($start_mysql, 0, 10) : '';

            $end_mysql = (string) get_post_meta($is_edit, 'WooCommerceEventsEndDateMySQLFormat', true);
            if ($end_mysql === '') {
                $end_h = (string) get_post_meta($is_edit, 'WooCommerceEventsEndDate', true);
                if ($end_h !== '') { $end_mysql = date('Y-m-d', strtotime($end_h)); }
            }
            $pref['end_date'] = $end_mysql ? substr($end_mysql, 0, 10) : '';

            $type = (string) get_post_meta($is_edit, 'WooCommerceEventsType', true);
            $pref['event_span'] = ( $type === 'sequential' || ($pref['end_date'] && $pref['end_date'] !== $pref['start_date']) ) ? 'multi' : 'single';

            $h = get_post_meta($is_edit,'WooCommerceEventsHour',true);
            $m = get_post_meta($is_edit,'WooCommerceEventsMinutes',true);
            if ($h !== '' && $m !== '') { $pref['start_time'] = sprintf('%02d:%02d', (int)$h, (int)$m); }

            // Venue + saved coordinates
            $pref['venue_name'] = get_post_meta($is_edit,'WooCommerceEventsLocation', true);

            // Try multiple possible FooEvents coordinate keys for back-compat
            $coords = (string) get_post_meta($is_edit,'WooCommerceEventsGoogleCoordinates',true);
            if ($coords==='') $coords = (string) get_post_meta($is_edit,'WooCommerceEventsGPS',true);
            if ($coords==='') $coords = (string) get_post_meta($is_edit,'WooCommerceEventsGoogleMaps',true);
            if ($coords && strpos($coords, ',') !== false){
                list($c_lat,$c_lng) = array_map('trim', explode(',', $coords, 2));
                $pref['lat'] = $c_lat;
                $pref['lng'] = $c_lng;
            }

            if ($pref['start_date'] && ! get_post_meta($is_edit,'WooCommerceEventsDateMySQLFormat',true)) {
                update_post_meta($is_edit,'WooCommerceEventsDateMySQLFormat',$pref['start_date'].' 00:00:00');
            }
            if ($pref['end_date'] && ! get_post_meta($is_edit,'WooCommerceEventsEndDateMySQLFormat',true)) {
                update_post_meta($is_edit,'WooCommerceEventsEndDateMySQLFormat',$pref['end_date'].' 23:59:59');
            }

            // Organiser details from product meta if present
            $profile['first_name'] = get_post_meta($is_edit,'_foop_org_first',true)   ?: $profile['first_name'];
            $profile['last_name']  = get_post_meta($is_edit,'_foop_org_last',true)    ?: $profile['last_name'];
            $profile['company']    = get_post_meta($is_edit,'_foop_org_company',true) ?: $profile['company'];
            $profile['email']      = get_post_meta($is_edit,'_foop_org_email',true)   ?: $profile['email'];
            $profile['phone']      = get_post_meta($is_edit,'_foop_org_phone',true)   ?: $profile['phone'];
            $profile['website']    = get_post_meta($is_edit,'_foop_org_website',true) ?: $profile['website'];

            // Address override from product
            $pref['addr1']    = get_post_meta($is_edit,'_foop_addr1',true)    ?: $pref['addr1'];
            $pref['addr2']    = get_post_meta($is_edit,'_foop_addr2',true)    ?: $pref['addr2'];
            $pref['city']     = get_post_meta($is_edit,'_foop_city',true)     ?: $pref['city'];
            $pref['province'] = get_post_meta($is_edit,'_foop_province',true) ?: $pref['province'];

            // License
            $pref['license_required'] = get_post_meta($is_edit,'_foop_license_required',true) ?: 'no';
            $pref['license_details']  = get_post_meta($is_edit,'_foop_license_details',true)  ?: '';

            // Category
            $terms = wp_get_post_terms($is_edit,'product_cat', array('fields'=>'all'));
            if(!is_wp_error($terms)){
                foreach($terms as $t){
                    if($t->slug !== $this->merch_category_slug){ $pref['event_category']=$t->slug; break; }
                }
            }
			
			// ---- Prefill Additional Info (edit) ----
			$pref['extra_info'] = get_post_meta($is_edit, '_foop_extra_info', true);

			// Fallback for legacy drafts (from when we stored it in post_content)
			if ($pref['extra_info'] === '') {
				$raw = (string) get_post_field('post_content', $is_edit);
				if ($raw !== '') {
					// strip the lines we inject for Address / Coordinates / License
					$tmp = preg_replace('~<p><strong>Address:</strong>.*?</p>~is', '', $raw);
					$tmp = preg_replace('~<p><strong>Coordinates:</strong>.*?</p>~is', '', $tmp);
					$tmp = preg_replace('~<p><strong>License required:</strong>.*?</p>~is', '', $tmp);
					$tmp = trim( wp_strip_all_tags( $tmp ) );
					if ($tmp !== '') $pref['extra_info'] = $tmp;
				}
			}
        }

		// ---- Prefill Google coords (lat/lng + "lat,lng") safely ----
		$pref_lat = '';
		$pref_lng = '';

		if ($editing) {
			$pref_lat = (string) get_post_meta($is_edit, '_foop_map_lat', true);
			$pref_lng = (string) get_post_meta($is_edit, '_foop_map_lng', true);

			$coord = (string) get_post_meta($is_edit, 'WooCommerceEventsGoogleCoordinates', true);
			if ($coord === '') { $coord = (string) get_post_meta($is_edit, 'WooCommerceEventsGPS', true); }

			if ($coord !== '') {
				$parts = array_map('trim', explode(',', $coord));
				if ($pref_lat === '' && !empty($parts[0])) $pref_lat = $parts[0];
				if ($pref_lng === '' && !empty($parts[1])) $pref_lng = $parts[1];
				if (empty($pref['map_hint'])) $pref['map_hint'] = $coord;
			}
		}
		if (!isset($pref['map_hint'])) $pref['map_hint'] = '';
		
        // Prefill Distances when editing
        $prefill_distance_html = '';
        if ($editing) {
            $prod = wc_get_product($is_edit);
            if ($prod && $prod->is_type('variable')) {
                $i = 0;
                foreach ($prod->get_children() as $vid) {
                    $v = wc_get_product($vid); if (!$v) continue;
                    $atts  = $v->get_attributes();
                    $raw   = isset($atts['attribute_distance']) ? (string)$atts['attribute_distance'] : '';
                    $label = get_post_meta($vid, '_sl_distance_label', true);
                    if ($label === '' || $label === null) {
                        $label = trim(preg_replace('/\s*[-–—]\s*[0-9]*\.?[0-9]+\s*km?$/i', '', $raw));
                    }
                    $km = get_post_meta($vid, '_sl_distance_km', true);
                    if ($km === '' || $km === null) {
                        if (preg_match('/([0-9]*\.?[0-9]+)\s*km?$/i', $raw, $m)) { $km = $m[1]; } else { $km = ''; }
                    }
                    $time  = get_post_meta($vid, '_sl_start_time', true);
                    $price = $v->get_regular_price();
                    $limit = (method_exists($v,'managing_stock') && $v->managing_stock()) ? $v->get_stock_quantity() : '';
                    if ($label !== '') update_post_meta($vid, '_sl_distance_label', $label);

                    $prefill_distance_html .= '<div class="item"><div class="foop-form-row">'
                        .'<div><label>Distance name *</label><input type="text" maxlength="20" name="dist['.$i.'][label]" required value="'.esc_attr($label).'"></div>'
						.'<div><label>Distance (km)</label><input class="foop-distance-field" type="number" step="0.01" min="0" max="9999" inputmode="decimal" data-foop-num="dec" name="dist['.$i.'][km]" value="'.esc_attr($km).'" placeholder="e.g. 5.0"></div>'
						.'<div><label>Price (R)</label><input class="foop-distance-field" type="number" step="0.01" min="0" max="99999" inputmode="decimal" data-foop-num="dec" name="dist['.$i.'][price]" value="'.esc_attr($price).'" placeholder="0.00"></div>'
						.'<div><label>Entry Limit</label><input class="foop-distance-field" type="number" min="0" max="999999" inputmode="numeric" data-foop-num="int" name="dist['.$i.'][limit]" value="'.esc_attr($limit).'" placeholder="0"></div>'
                        .'<div><label>Start Time</label><input type="time" name="dist['.$i.'][time]" value="'.esc_attr($time).'"></div>'
                        .'<div class="foop-actions-right"><a href="#" data-remove-item class="btn">Remove</a></div>'
                    .'</div></div>';
                    $i++;
                }
            }
        }
		

	/* ----------------------------------------
	 * CHUNK 6/8
     * ----------------------------------------- */
		
		
        /* ---- Render form ---- */
        ob_start();
        echo '<div class="foop-card"><h3 style="margin:0 0 .5rem">'.($editing ? 'Edit Event' : 'Create Event').'</h3>';

        if(!empty($errors)){ echo '<div class="foop-card" style="border-color:#d63638;color:#d63638"><strong>There were problems:</strong><ul>'; foreach($errors as $e){ echo '<li>'.esc_html($e).'</li>'; } echo '</ul></div>'; }
        if(!empty($success)){ echo '<div class="foop-card" style="border-color:#46b450;color:#155724"><ul>'; foreach($success as $s){ echo '<li>'.wp_kses_post($s).'</li>'; } echo '</ul></div>'; }

        // Distance placeholders: grey + disappear on click (focus)
        echo '<style>
          .foop-distance-field::placeholder{color:#d3d3d3;opacity:1}
          .foop-distance-field:focus::placeholder{color:transparent}
        </style>';
		
		echo '<style>
		  .foop-card .foop-distance-field::placeholder{color:#d3d3d3 !important;opacity:1!important}
		  .foop-card .foop-distance-field::-webkit-input-placeholder{color:#d3d3d3 !important;opacity:1!important}
		  .foop-card .foop-distance-field::-moz-placeholder{color:#d3d3d3 !important;opacity:1!important}
		  .foop-card .foop-distance-field:-ms-input-placeholder{color:#d3d3d3 !important;opacity:1!important}
		  .foop-card .foop-distance-field::-ms-input-placeholder{color:#d3d3d3 !important;opacity:1!important}

		  /* keep the behaviour where placeholder disappears on focus */
		  .foop-distance-field:focus::placeholder{color:transparent}
		</style>';

        echo '<form class="foop-card foop-create-form" method="post" enctype="multipart/form-data" data-mode="'.($editing?'edit':'create').'">';
        wp_nonce_field('foop_create_event','foop_create_nonce');
        echo '<input type="hidden" name="foop_action" value="'.($editing?'edit_event':'create_event').'">';
        if($editing){ echo '<input type="hidden" name="foop_edit_id" value="'.intval($is_edit).'">'; }

        /* -------- Organiser details -------- */
        echo '<h3>Organiser details</h3><div class="foop-form-row">';
        echo '<div><label>First Name *</label><input type="text" name="first_name" required value="'.esc_attr($profile['first_name']).'"></div>';
        echo '<div><label>Last Name *</label><input type="text" name="last_name" required value="'.esc_attr($profile['last_name']).'"></div>';
        echo '<div><label>Organiser Name (Company) *</label><input type="text" name="org_name" required value="'.esc_attr($profile['company']).'"></div>';
        echo '<div><label>Email *</label><input type="email" name="email" required value="'.esc_attr($profile['email']).'"></div>';
        echo '<div><label>Telephone *</label><input type="text" name="phone" required value="'.esc_attr($profile['phone']).'"></div>';
		echo '<div><label>Website *</label>
		  <input type="url" name="website" value="'.esc_attr($p['website']).'" placeholder="https://your-site.com" inputmode="url">
		  <span class="help">Tip: include https:// e.g. https://your-site.com</span>
		</div>';
        echo '</div>';

        /* -------- Basic info -------- */
        echo '<h3>Basic Event Info</h3><div class="foop-form-row">';
        echo '<div style="grid-column:1/-1"><label>Event Name *</label><input type="text" name="event_name" required value="'.esc_attr($pref['event_name']).'"></div>';
        echo '<div style="grid-column:1/-1"><label>Event Category *</label><select name="event_category" required><option value="">Select a category</option>';
        foreach($this->event_categories as $slug=>$name){
            $sel = selected($pref['event_category'],$slug,false);
            echo '<option value="'.esc_attr($slug).'" '.$sel.'>'.esc_html($name).'</option>';
        }
        echo '</select></div>';
        echo '</div>';

        /* -------- Event details -------- */
        echo '<h3>Event Details</h3><div class="foop-form-row">';
		// Event span takes full row; start/end on next row; end is disabled until multi-day
		$end_disabled = ($pref['event_span'] !== 'multi') ? 'disabled aria-disabled="true" tabindex="-1"' : '';
		echo '<div style="grid-column:1/-1"><label>Single or Multi-Day? *</label>
				<select id="foop-event-span" name="event_span" required>
				  <option value="single" '.selected($pref['event_span'],'single',false).'>Single</option>
				  <option value="multi"  '.selected($pref['event_span'],'multi',false).'>Multi-day</option>
				</select>
			  </div>';

		echo '<div><label>Start Date *</label>
				<input id="foop-start-date" type="date" name="start_date" value="'.esc_attr($pref['start_date']).'" required>
			  </div>';

		echo '<div><label>End Date</label>
				<input id="foop-end-date" type="date" name="end_date" value="'.esc_attr($pref['end_date']).'" '.$end_disabled.'>
				<div class="foop-note" style="font-size:12px;margin-top:4px">End date activates on multi-day events.</div>
			  </div>';
		echo '<script>
			(function(){
			  var span  = document.getElementById("foop-event-span");
			  var start = document.getElementById("foop-start-date");
			  var end   = document.getElementById("foop-end-date");

			  if (!span || !start || !end) return;

			  // Today as YYYY-MM-DD
			  var today = new Date();
			  var pad = n => String(n).padStart(2,"0");
			  var todayStr = today.getFullYear()+"-"+pad(today.getMonth()+1)+"-"+pad(today.getDate());

			  // Ensure start date can\'t be in the past
			  start.setAttribute("min", todayStr);

			  function syncEndMin(){
				if (start.value) {
				  end.setAttribute("min", start.value);
				  // If end is set but < start, bump it to start
				  if (end.value && end.value < start.value) end.value = start.value;
				} else {
				  end.removeAttribute("min");
				}
			  }

			  function toggleEnd(){
				var isMulti = (span.value === "multi");
				if (isMulti){
				  end.removeAttribute("disabled");
				  end.removeAttribute("aria-disabled");
				  end.removeAttribute("tabindex");
				} else {
				  // Clear and disable when Single-day
				  end.value = "";
				  end.setAttribute("disabled","disabled");
				  end.setAttribute("aria-disabled","true");
				  end.setAttribute("tabindex","-1");
				}
				syncEndMin();
			  }

			  // Wire up changes
			  span.addEventListener("change", toggleEnd);
			  start.addEventListener("change", syncEndMin);
			  // Initial state on load
			  toggleEnd();
			})();
			</script>';
		
        echo '<div><label>Start Time (HH:MM) *</label><input type="time" name="start_time" value="'.esc_attr($pref['start_time']).'" required></div>';
        echo '<div><label>Is license required? *</label><select name="license_required" required><option value="no" '.selected('no',$pref['license_required'],false).'>No</option><option value="yes" '.selected('yes',$pref['license_required'],false).'>Yes</option></select></div>';
        echo '<div data-license-details style="grid-column:1/-1;'.($pref['license_required']==='yes'?'':'display:none').';"><label>License details & cost *</label><textarea name="license_details" rows="3" '.($pref['license_required']==='yes'?'required':'').'>'.esc_textarea($pref['license_details']).'</textarea></div>';
        echo '</div>';
		// Show only when license is required
		$fee_style = ( ($pref['license_required'] ?? 'no') === 'yes' ) ? '' : 'display:none';
		echo '<div id="sl-temp-lic-fee-row" style="'.$fee_style.';grid-column:1/-1">';
		echo '  <label>Temporary licence fee (per attendee)</label>';
		echo '  <input type="number" name="temp_license_fee" step="0.01" min="0" inputmode="decimal" value="'.esc_attr($pref['temp_license_fee']).'" placeholder="e.g. 50.00">';
		echo '  <div class="foop-note" style="font-size:12px;margin-top:4px">Shown at checkout under attendee details when this event requires a licence.</div>';
		echo '</div>';

		// Toggle the row when the selector changes
		echo '<script>
		(function(){
		  var sel = document.querySelector(\'select[name="license_required"]\');
		  var row = document.getElementById("sl-temp-lic-fee-row");
		  if(!sel || !row) return;
		  function sync(){ row.style.display = (sel.value === "yes") ? "" : "none"; }
		  sel.addEventListener("change", sync);
		  document.addEventListener("DOMContentLoaded", sync);
		  sync();
		})();
		</script>';

        /* -------- Distances (with prefill) -------- */
		echo '<div class="foop-card" id="foop-distances-card"><h4>Distances *</h4><div class="foop-field-error" id="foop-distances-error" style="display:none;margin:.25rem 0">Please add at least one Distance (e.g. 5km)</div><p class="foop-note">Add one or more distances for your event. Include a Distance Name (e.g. Fun Run) and price/capacity.</p>';
        echo '<div id="foop-distances" class="foop-repeater">'.$prefill_distance_html.'</div><p><a href="#" class="foop-btn" data-add-distance>+ Add Distance</a></p></div>';

        echo '<script type="text/template" id="foop-distance-template">';
        echo '<div class="foop-form-row">';
		echo '<div><label>Distance name *</label><input type="text" maxlength="20" name="dist[__i__][label]" required class="foop-distance-field foop-distance-ph" placeholder="Fun Run"></div>';
		echo '<div><label>Distance (km)</label><input class="foop-distance-field foop-distance-ph" type="number" step="0.01" min="0" max="9999" inputmode="decimal" data-foop-num="dec" name="dist[__i__][km]" placeholder="e.g. 21.1"></div>';
		echo '<div><label>Price (R)</label><input class="foop-distance-field foop-distance-ph" type="number" step="0.01" min="0" max="99999" inputmode="decimal" data-foop-num="dec" name="dist[__i__][price]" placeholder="0.00"></div>';
		echo '<div><label>Entry Limit</label><input class="foop-distance-field foop-distance-ph" type="number" min="0" max="999999" inputmode="numeric" data-foop-num="int" name="dist[__i__][limit]" placeholder="0"></div>';
        echo '<div><label>Start Time *</label><input type="time" name="dist[__i__][time]" required></div>';
        echo '<div class="foop-actions-right"><a href="#" data-remove-item class="btn">Remove</a></div>';
        echo '</div>';
        echo '</script>';
		
		// Light-touch guards: keep label <=20 while typing, block e/E/+/- keys,
		// and clamp numbers only after blur/change (so decimals type naturally).
		echo '<script>
		(function(){
		  var wrap = document.getElementById("foop-distances");
		  if (!wrap) return;

		  // 1) Limit distance name length while typing (does not touch numeric fields)
		  wrap.addEventListener("input", function(e){
			var t = e.target;
			if (!t || !t.name) return;
			if (/\[label\]$/.test(t.name) && t.value.length > 20){
			  t.value = t.value.slice(0, 20);
			}
		  }, true);

		  // 2) Block scientific-notation/sign chars on ANY number input (decimals still OK)
		  document.addEventListener("keydown", function(e){
			var t = e.target;
			if (!t || t.tagName !== "INPUT" || t.type !== "number") return;
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-" ||
				e.code === "NumpadAdd" || e.code === "NumpadSubtract") {
			  e.preventDefault();
			}
		  }, true);

		  // 3) Clamp numeric values ONLY after the user finishes typing
		  function clampNumeric(t){
			if (!t || !t.name) return;
			var v = t.value;
			if (v === "") return;

			if (/\[km\]$/.test(t.name)) {
			  var n = parseFloat(v);
			  if (isNaN(n)) return;
			  if (n < 0) n = 0;
			  if (n > 9999) n = 9999;
			  t.value = n;
			  return;
			}
			if (/\[price\]$/.test(t.name)) {
			  var n = parseFloat(v);
			  if (isNaN(n)) return;
			  if (n < 0) n = 0;
			  if (n > 99999) n = 99999;
			  t.value = n;
			  return;
			}
			if (/\[limit\]$/.test(t.name)) {
			  var n = parseInt(v, 10);
			  if (isNaN(n)) return;
			  if (n < 0) n = 0;
			  if (n > 999999) n = 999999;
			  t.value = n;
			  return;
			}
		  }

		  wrap.addEventListener("change", function(e){ clampNumeric(e.target); }, true);
		  wrap.addEventListener("blur",  function(e){ clampNumeric(e.target); }, true);
		})();
		</script>';

        /* -------- Event image -------- */
        echo '<div class="foop-form-row">
                <div style="grid-column:1/-1">
                    <label>Event image (max 20MB) *</label>
                    <div class="foop-image-input">';
                        if ($thumb_html) {
                            echo '<div class="foop-thumb-wrap">'.$thumb_html.'</div>';
                        }
                        echo '<input type="file" name="event_image" accept="image/*" '.($editing?'':'required').'>';
                        if ($thumb_html) {
                            echo '<label class="foop-remove" style="margin-left:12px">
                                    <input type="checkbox" name="remove_image" value="1"> Remove current image
                                  </label>';
                        }
        echo        '</div>
                </div>
            </div>';

        /* -------- Additional info -------- */
        echo '<div style="grid-column:1/-1"><label><br>Additional Event Info *</label><textarea name="extra_info" rows="4" required>'.esc_textarea($pref['extra_info']).'</textarea></div>';

        /* -------- Location with Google Places -------- */
        echo '<h3>Event Location</h3><div class="foop-form-row">';
        echo '<div style="grid-column:1/-1"><label>Venue Name *</label><input type="text" name="venue_name" required value="'.esc_attr($pref['venue_name']).'"></div>';
		echo '<div style="grid-column:1/-1">
				<label>Search location</label>
				<input id="foop-place-input"
					   data-foop-places
					   type="text"
					   name="place_search"
					   placeholder="Type a venue or address..." value="">
				<input type="hidden" id="foop-place-lat" name="map_lat" value="'.esc_attr($pref_lat).'">
				<input type="hidden" id="foop-place-lng" name="map_lng" value="'.esc_attr($pref_lng).'">
				<input type="text" id="foop-map-hint" name="map_hint"
					   value="'.esc_attr($pref['map_hint']).'"
					   placeholder="-33.9249,18.4241"
					   style="margin-top:6px;opacity:.85">
			  </div>';

        // Address fields (can be auto-filled from Places)
        echo '<div><label>Address Line 1 *</label><input type="text" name="addr1" required value="'.esc_attr($pref['addr1']).'"></div>';
        echo '<div><label>Address Line 2 *</label><input type="text" name="addr2" required value="'.esc_attr($pref['addr2']).'"></div>';
        echo '<div><label>City *</label><input type="text" name="city" required value="'.esc_attr($pref['city']).'"></div>';
        echo '<div><label>Province *</label><input type="text" name="province" required value="'.esc_attr($pref['province']).'"></div>';

        // Hidden coordinates (lat,lng) + hidden map_hint for back-compat with validators and storage
        $map_hint_val = ($pref['lat'] !== '' && $pref['lng'] !== '') ? (trim($pref['lat']).','.trim($pref['lng'])) : '';
        echo '</div>'; // end location grid

        /* -------- Merchandise -------- */
        echo '<h3>Merchandise (optional)</h3><div class="foop-form-row">';
        echo '<div><label>Sell merchandise?</label><select name="merch_toggle"><option value="no">No</option><option value="yes">Yes</option></select></div>';
        echo '</div>';

        echo '<div class="foop-card" data-merch-box style="display:none"><h4>Items</h4><div id="foop-merch" class="foop-repeater"></div><p><a href="#" class="foop-btn" data-add-merch>+ Add Item</a></p></div>';
        echo '<script type="text/template" id="foop-merch-template">';
        echo '<div class="foop-form-row">';
        echo '<div><label>Merch Name</label><input type="text" name="merch[__i__][name]"></div>';
        echo '<div><label>Price (R)</label><input type="number" step="0.01" name="merch[__i__][price]"></div>';
        echo '<div style="grid-column:1/-1"><label>Sizes (comma separated)</label><input type="text" name="merch[__i__][sizes]" placeholder="S, M, L"></div>';
        echo '<div style="grid-column:1/-1"><label>Colours (comma separated)</label><input type="text" name="merch[__i__][colours]" placeholder="Blue, Red"></div>';
        echo '<div style="grid-column:1/-1"><label>Image</label><input type="file" name="merch_img___i__" accept="image/*"></div>';
        echo '<div class="foop-actions-right"><a href="#" data-remove-item class="btn">Remove</a></div>';
        echo '</div>';
        echo '</script>';

        // Footer buttons
        $dash_url = add_query_arg(array(self::QV_TAB=>'dashboard'), $this->portal_page_url());
        $submit_label = $editing ? 'Save changes' : 'Submit Event';
        $confirm_js   = $editing ? "if(!confirm('Are you sure you want to change the event?')){event.preventDefault();return false;}" : "";
        echo '<p style="display:flex;gap:.5rem;align-items:center">';
        echo '<a href="'.esc_url($dash_url).'" class="foop-btn" style="background:#fff;color:#111;border-color:#ddd">Cancel</a>';
        echo '<button type="submit" class="foop-btn" onclick="'.$confirm_js.'">'.$submit_label.'</button>';
        echo '</p>';

        /* -------- Google Places Autocomplete init -------- */
        $gkey = defined('GOOGLE_MAPS_API_KEY') ? trim(constant('GOOGLE_MAPS_API_KEY')) : '';
        
		// Client-side checks: distances + date rules; coords optional; keep spinner
		echo '<script>
		(function(){
		  var form = document.currentScript.closest("form");
		  if(!form) return;

		  function openSpinner(){
			var overlay = document.getElementById("foop-overlay");
			if (overlay) overlay.classList.add("open");
			var btn = form.querySelector("button[type=\"submit\"]");
			if (btn){
			  btn.disabled = true;
			  btn.setAttribute("aria-disabled","true");
			  btn.dataset._txt = btn.textContent;
			  btn.textContent = "Saving…";
			}
		  }

		  function todayStr(){
			var t=new Date();
			var mm=("0"+(t.getMonth()+1)).slice(-2);
			var dd=("0"+t.getDate()).slice(-2);
			return t.getFullYear()+"-"+mm+"-"+dd;
		  }

		  // Set min constraints live
		  var start = form.querySelector("input[name=\"start_date\"]");
		  var end   = form.querySelector("input[name=\"end_date\"]");
		  var span  = form.querySelector("select[name=\"event_span\"]");
		  if (start){ start.min = todayStr(); }
		  function syncEndMin(){ if(end && start && start.value){ end.min = start.value; } }
		  if (start){ start.addEventListener("change", syncEndMin); syncEndMin(); }

		  form.addEventListener("submit", function(e){
			// 1) Require at least one Distance label
			var labels = form.querySelectorAll("#foop-distances .item input[name^=\"dist\"][name$=\"[label]\"]");
			var hasDistance = false, badLabel = null;
			labels.forEach(function(inp){
			  var v = (inp.value||"").trim();
			  if (v !== "") hasDistance = true;
			  if (v.length > 20) badLabel = inp;
			});
			if (!hasDistance){
			  e.preventDefault();
			  alert("Please add at least one Distance (e.g. 5km or Fun Run).");
			  var addBtn = form.querySelector("[data-add-distance]");
			  if (addBtn) addBtn.focus();
			  return;
			}
			if (badLabel){
			  e.preventDefault();
			  alert("Distance name must be 20 characters or fewer.");
			  badLabel.focus();
			  return;
			}

			// 2) Number caps (client-side guard; server will clamp too)
			function overMax(nodeList, suffix, max, isInt){
			  var bad=null;
			  nodeList.forEach(function(i){
				var v=i.value;
				if(v==="" || v==null) return;
				var num = isInt ? parseInt(v,10) : parseFloat(v);
				if (isNaN(num)) return;
				if (num > max){ bad=i; }
			  });
			  return bad;
			}
			var kmBad   = overMax(form.querySelectorAll(\'#foop-distances input[name$="[km]"]\'),   "[km]",   9999,   false);
			var prBad   = overMax(form.querySelectorAll(\'#foop-distances input[name$="[price]"]\'),"[price]",99999,  false);
			var capBad  = overMax(form.querySelectorAll(\'#foop-distances input[name$="[limit]"]\'),"[limit]",999999, true);
			if (kmBad){ e.preventDefault(); alert("Distance (km) cannot exceed 9,999."); kmBad.focus(); return; }
			if (prBad){ e.preventDefault(); alert("Price cannot exceed 99,999."); prBad.focus(); return; }
			if (capBad){ e.preventDefault(); alert("Entry Limit cannot exceed 999,999."); capBad.focus(); return; }

			// 3) Date rules
			var sd = start ? (start.value||"") : "";
			var today = todayStr();
			if (sd && sd < today){
			  e.preventDefault();
			  alert("Start Date cannot be in the past.");
			  start.focus();
			  return;
			}
			if (span && span.value === "multi"){
			  var ed = end ? (end.value||"") : "";
			  if (!ed){
				e.preventDefault();
				alert("End Date is required for multi-day events.");
				if (end) end.focus();
				return;
			  }
			  if (sd && ed && ed < sd){
				e.preventDefault();
				alert("End Date cannot be before the Start Date.");
				end.focus();
				return;
			  }
			  if (sd && ed && ed === sd){
				if (!confirm("End Date equals Start Date. Consider using ‘Single’ instead. Continue?")){
				  e.preventDefault();
				  return;
				}
			  }
			}

			// 4) All OK — show spinner and submit
			openSpinner();
		  }, true);
		})();
		</script>';

		
		
        echo '</form>';
        echo '</div>';
        return ob_get_clean();
    }
	
	
	/* ----------------------------------------
	 * CHUNK 7/8
     * ----------------------------------------- */

    public function maybe_handle_create_event_submit(){
        if(!is_user_logged_in()) return;

        $is_create = (isset($_POST['foop_action']) && $_POST['foop_action']==='create_event');
        $is_edit   = (isset($_POST['foop_action']) && $_POST['foop_action']==='edit_event');

        if(!$is_create && !$is_edit) return;
        if(!isset($_POST['foop_create_nonce']) || !wp_verify_nonce($_POST['foop_create_nonce'],'foop_create_event')) return;
        if(!$this->current_user_is_organizer_like()) return;

        $errors=array(); $messages=array();

        $event_name  = sanitize_text_field($_POST['event_name'] ?? '');
        $span        = sanitize_text_field($_POST['event_span'] ?? 'single');
        $start_date  = sanitize_text_field($_POST['start_date'] ?? '');
        $end_date    = sanitize_text_field($_POST['end_date'] ?? '');
        $start_time  = sanitize_text_field($_POST['start_time'] ?? '');
        $event_cat   = sanitize_text_field($_POST['event_category'] ?? '');

		// Coords from Places → map_hint (lat,lng) (accept map_lat/map_lng or lat/lng)
		$lat = isset($_POST['map_lat']) ? sanitize_text_field($_POST['map_lat'])
			 : (isset($_POST['lat']) ? sanitize_text_field($_POST['lat']) : '');
		$lng = isset($_POST['map_lng']) ? sanitize_text_field($_POST['map_lng'])
			 : (isset($_POST['lng']) ? sanitize_text_field($_POST['lng']) : '');
		if (empty($_POST['map_hint']) && $lat !== '' && $lng !== '') {
			$_POST['map_hint'] = $lat.','.$lng;
		}
        $map_hint = sanitize_text_field($_POST['map_hint'] ?? '');

        if(!$event_name) $errors[]='Event name is required.';
        if(!$start_date) $errors[]='Start date is required.';
        if(!$event_cat)  $errors[]='Please select an event category.';
        if($span==='multi' && !$end_date) $errors[]='End date is required for multi-day events.';


        // --- Distances: require at least one BEFORE submit (server-side hard check too) ---
        $dist = isset($_POST['dist']) && is_array($_POST['dist']) ? $_POST['dist'] : array();
        $dist_clean=array();
        foreach($dist as $row){
            $label=sanitize_text_field($row['label'] ?? '');
            if(!$label) continue;
            $km = (string)($row['km'] ?? '');
            $price = (string)($row['price'] ?? '');
            $limit = (string)($row['limit'] ?? '');
            // hard clamp non-negative & max
            $kmf   = $km   !== '' ? max(0, min(9999, floatval($km))) : 0;
            $prf   = $price!== '' ? max(0, min(99999, floatval($price))) : 0;
            $limi  = $limit!== '' ? max(0, min(99999, intval($limit))) : 0;

            $dist_clean[]=array(
                'label'=>$label,
                'km'   =>$kmf,
                'price'=>$prf,
                'limit'=>$limi,
                'time' =>sanitize_text_field($row['time'] ?? ''),
            );
        }
        if(empty($dist_clean)) $errors[]='Please add at least one Distance (e.g. 5km)';

        if(!empty($errors)){
            add_filter('the_content', function($c) use($errors){ return $this->render_portal_html('create',$errors); });
            return;
        }

        // Resolve product id first
        $product_id = 0;

        if ( $is_edit ) {
            $product_id = intval( $_POST['foop_edit_id'] ?? 0 );

            // Permission + status checks
            if (
                ! $product_id ||
                ! $this->user_owns_event( get_current_user_id(), $product_id ) ||
                get_post_status( $product_id ) !== 'draft'
            ) {
                $errors[] = 'You cannot edit this event.';
                add_filter('the_content', function($c) use($errors){ return $this->render_portal_html('create',$errors); });
                return;
            }

            // Remove current thumbnail if requested (now safe: $product_id is known & validated)
            if ( isset($_POST['remove_image']) && in_array($_POST['remove_image'], array('1','on','yes'), true) ) {
                delete_post_thumbnail( $product_id );
            }

            // Proceed with edit
            wp_update_post(array('ID'=>$product_id,'post_title'=>$event_name,'post_status'=>'draft'));
            $product = wc_get_product($product_id);
            if ( $product && method_exists( $product, 'set_catalog_visibility' ) ) {
                $product->set_catalog_visibility('visible');
            }

        } else {
            // Create new product
            $product = new WC_Product_Variable();
            $product->set_name($event_name);
            $product->set_status('draft');
            $product->set_catalog_visibility('visible');
            $product->set_virtual(true);
            $product->set_manage_stock(false);
            $product_id = $product->save();
            update_post_meta($product_id, self::PRODUCT_ORGANIZERS_META, array(get_current_user_id()));
        }

        // Organiser + address
        update_post_meta($product_id,'_foop_org_first',   sanitize_text_field($_POST['first_name'] ?? ''));
        update_post_meta($product_id,'_foop_org_last',    sanitize_text_field($_POST['last_name'] ?? ''));
        update_post_meta($product_id,'_foop_org_company', sanitize_text_field($_POST['org_name'] ?? ''));
        update_post_meta($product_id,'_foop_org_email',   sanitize_email($_POST['email'] ?? ''));
        update_post_meta($product_id,'_foop_org_phone',   sanitize_text_field($_POST['phone'] ?? ''));
        update_post_meta($product_id,'_foop_org_website', esc_url_raw($_POST['website'] ?? ''));

        update_post_meta($product_id,'_foop_addr1',       sanitize_text_field($_POST['addr1'] ?? ''));
        update_post_meta($product_id,'_foop_addr2',       sanitize_text_field($_POST['addr2'] ?? ''));
        update_post_meta($product_id,'_foop_city',        sanitize_text_field($_POST['city'] ?? ''));
        update_post_meta($product_id,'_foop_province',    sanitize_text_field($_POST['province'] ?? ''));
        $this->foop_tag_city_province($product_id, $_POST['city'] ?? '', $_POST['province'] ?? '');

        // License
        $lic_required = (isset($_POST['license_required']) && $_POST['license_required']==='yes') ? 'yes' : 'no';
        update_post_meta($product_id,'_foop_license_required', $lic_required);
        update_post_meta($product_id,'_foop_license_details',  sanitize_text_field($_POST['license_details'] ?? ''));

        // Core FooEvents meta (also saves GPS/map)
        $this->set_fooevents_meta($product_id, $span, $start_date, $start_time, $end_date);
        $this->ensure_default_attendee_fields($product_id);

        if($map_hint!==''){
            // Store GPS for other parts of the stack that look at this key
            update_post_meta($product_id,'WooCommerceEventsGoogleCoordinates', $map_hint);
        }

        // Category
        $term = get_term_by('slug',$event_cat,'product_cat');
        if($term && !is_wp_error($term)){
            wp_set_post_terms($product_id, array(intval($term->term_id)), 'product_cat', false);
        }

        // Image
        if(isset($_FILES['event_image']) && !empty($_FILES['event_image']['name'])){
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            $attachment_id = media_handle_upload('event_image', $product_id);
            if(!is_wp_error($attachment_id)){
                set_post_thumbnail($product_id, $attachment_id);
            }
        }

        // Attribute: Distance (builds combined label "Name - Xkm")
        $attr_name='Distance';
        $attr_key='distance';
        $terms=array();
        foreach ($dist_clean as $d) {
            $clean_label = preg_replace('/\s*[-–—]\s*[0-9]*\.?[0-9]+\s*km?$/i', '', (string)$d['label']);
            $km_txt = (!empty($d['km']) && floatval($d['km'])>0)
                ? rtrim(rtrim(number_format(floatval($d['km']), 2, '.', ''), '0'), '.') . 'km'
                : '';
            $terms[] = trim($clean_label . ($km_txt ? ' - '.$km_txt : ''));
        }
        $product_attributes = array();
        $pa = new WC_Product_Attribute();
        $pa->set_id(0);
        $pa->set_name($attr_name);
        $pa->set_options($terms);
        $pa->set_visible(true);
        $pa->set_variation(true);
        $product_attributes[$attr_name] = $pa;

        $product->set_attributes($product_attributes);
        $product->save();

        // Rebuild variations on edit
        if($is_edit){
            foreach($product->get_children() as $old){ wp_delete_post($old,true); }
        }

        // Variations
        $variation_ids=array();
        foreach ($dist_clean as $d) {
            $clean_label = preg_replace('/\s*[-–—]\s*[0-9]*\.?[0-9]+\s*km?$/i', '', (string)$d['label']);
            $km_val = (isset($d['km']) && $d['km'] !== '' && is_numeric($d['km'])) ? floatval($d['km']) : '';
            $km_txt = ($km_val !== '' && $km_val > 0)
                ? rtrim(rtrim(number_format($km_val, 2, '.', ''), '0'), '.') . 'km'
                : '';
            $combined = trim($clean_label . ($km_txt ? ' - '.$km_txt : ''));

            $variation = new WC_Product_Variation();
            $variation->set_parent_id($product_id);
            $variation->set_attributes(array('attribute_'.$attr_key => $combined));

            if (!empty($d['price'])) { $variation->set_regular_price(wc_format_decimal($d['price'])); }
            if (!empty($d['limit'])) { $variation->set_manage_stock(true); $variation->set_stock_quantity(intval($d['limit'])); }
            else { $variation->set_manage_stock(false); }

            $vid = $variation->save();
            update_post_meta($vid, '_sl_distance_label', $clean_label);
            if (!empty($d['time'])) { update_post_meta($vid, '_sl_start_time', sanitize_text_field($d['time'])); }
            if ($km_val !== '') { update_post_meta($vid, '_sl_distance_km', $km_val); }
            $variation_ids[] = $vid;
        }

        // Content blocks (address / coords / extra / license)
        $content_blocks = array();
        $addr = array_filter(array($_POST['addr1']??'', $_POST['addr2']??'', $_POST['city']??'', $_POST['province']??''));
        if(!empty($addr)) $content_blocks[] = '<p><strong>Address:</strong> '.esc_html(implode(', ', array_map('sanitize_text_field', $addr))).'</p>';
        if(!empty($map_hint)) $content_blocks[] = '<p><strong>Coordinates:</strong> '.esc_html($map_hint).'</p>';
		// NEW: store Additional Info in meta only (do not inject into post content)
		$extra_info = isset($_POST['extra_info']) ? wp_kses_post($_POST['extra_info']) : '';
		update_post_meta($product_id, '_foop_extra_info', $extra_info);

        if(!empty($_POST['license_required']) && $_POST['license_required']==='yes'){
            $content_blocks[] = '<p><strong>License required:</strong> '.esc_html(sanitize_text_field($_POST['license_details']??'' )).'</p>';
        }
		
		// Normalise + save temp licence fee on the event product
		$lic_required = ( isset($_POST['license_required']) && $_POST['license_required'] === 'yes' );
		$fee_raw      = isset($_POST['temp_license_fee']) ? wc_format_decimal( wp_unslash($_POST['temp_license_fee']) ) : '';
		$fee          = $lic_required ? max( 0, (float) $fee_raw ) : 0.0;

		// Always store a numeric value; remove meta if not needed
		if ( $fee > 0 ) {
			update_post_meta( $product_id, '_sl_temp_license_fee', $fee );
		} else {
			// keep DB tidy when fee is not used
			delete_post_meta( $product_id, '_sl_temp_license_fee' );
		}
		
        if(!empty($content_blocks)){
            wp_update_post(array('ID'=>$product_id,'post_content'=>implode("\n",$content_blocks)));
        }
		


        // Optional: Merchandise
        $cross=array();
        if(isset($_POST['merch_toggle']) && $_POST['merch_toggle']=== 'yes' && !empty($_POST['merch']) && is_array($_POST['merch'])){
            $merch_term = taxonomy_exists('product_cat') ? get_term_by('slug',$this->merch_category_slug,'product_cat') : null;
            foreach($_POST['merch'] as $i=>$row){
                $name=sanitize_text_field($row['name'] ?? '');
                if(!$name) continue;
                $price = floatval($row['price'] ?? 0);
                $sizes = array_values(array_filter(array_map('trim', explode(',', sanitize_text_field($row['sizes'] ?? '')))));
                $colours = array_values(array_filter(array_map('trim', explode(',', sanitize_text_field($row['colours'] ?? '')))));

                if(!empty($sizes) || !empty($colours)){
                    $p = new WC_Product_Variable();
                    $p->set_name($name);
                    $p->set_status('draft');
                    $p->set_manage_stock(false);
                    $pid = $p->save();

                    $attrs = array();
                    if(!empty($sizes)){
                        $a = new WC_Product_Attribute();
                        $a->set_id(0); $a->set_name('Size'); $a->set_options($sizes); $a->set_visible(true); $a->set_variation(true);
                        $attrs['Size']=$a;
                    }
                    if(!empty($colours)){
                        $a = new WC_Product_Attribute();
                        $a->set_id(0); $a->set_name('Colour'); $a->set_options($colours); $a->set_visible(true); $a->set_variation(true);
                        $attrs['Colour']=$a;
                    }
                    $p->set_attributes($attrs); $p->save();

                    $size_list   = !empty($sizes)   ? $sizes   : array('');
                    $colour_list = !empty($colours) ? $colours : array('');
                    foreach($size_list as $sz){
                        foreach($colour_list as $co){
                            $va = new WC_Product_Variation();
                            $va->set_parent_id($pid);
                            $atts = array();
                            if($sz!=='') $atts['attribute_size']   = $sz;
                            if($co!=='') $atts['attribute_colour'] = $co;
                            $va->set_attributes($atts);
                            if($price>0) $va->set_regular_price( wc_format_decimal($price) );
                            $va->set_manage_stock(false);
                            $va->save();
                        }
                    }
                } else {
                    $p = new WC_Product_Simple();
                    $p->set_name($name);
                    $p->set_status('draft');
                    if($price>0) $p->set_regular_price(wc_format_decimal($price));
                    $pid = $p->save();
                }

                update_post_meta($pid, self::PRODUCT_ORGANIZERS_META, array(get_current_user_id()));
                if($merch_term && !is_wp_error($merch_term)){
                    wp_set_post_terms($pid, array(intval($merch_term->term_id)),'product_cat', false);
                }
                $field_name = 'merch_img_' . $i;
                if(isset($_FILES[$field_name]) && !empty($_FILES[$field_name]['name'])){
                    require_once ABSPATH . 'wp-admin/includes/file.php';
                    require_once ABSPATH . 'wp-admin/includes/media.php';
                    require_once ABSPATH . 'wp-admin/includes/image.php';
                    $att = media_handle_upload($field_name, $pid);
                    if(!is_wp_error($att)){ set_post_thumbnail($pid, $att); }
                }
                $cross[]=$pid;
            }
        }
        if (!empty($cross)) {
            $ev = wc_get_product($product_id);
            if ($ev) { $ev->set_cross_sell_ids($cross); $ev->save(); }
        }
        $this->ensure_default_attendee_fields($product_id);

        $edit_url = admin_url('post.php?post='.$product_id.'&action=edit');
        $success = array(
            ($is_edit ? 'Draft event updated: ' : 'Draft event created: ') .
            '<a target="_blank" href="'.esc_url($edit_url).'">'.esc_html($event_name).'</a>',
            'Variations: '.count($variation_ids),
            (!empty($cross) ? 'Merchandise items created: '.count($cross) : '')
        );
        add_filter('the_content', function($c) use ($success) {
            return $this->render_portal_html('dashboard', array(), $success);
        });
    }
	
	/* ----------------------------------------
	 * CHUNK 8/8
     * ----------------------------------------- */

    /* -------------------------------------------------
     * Variation breakdown (modal) & counts
     * ------------------------------------------------- */
    private function render_variation_breakdown_table($product_id, $from_ts=null, $to_ts=null){
        $product = wc_get_product($product_id);
        if(!$product) return '<p>Product not found.</p>';

        if(!$product->is_type('variable')){
            $issued = $this->get_ticket_count_for_product($product_id,$from_ts,$to_ts);
            $cap = ($product->managing_stock() && $product->get_stock_quantity() !== null) ? intval($product->get_stock_quantity()) : null;
            $rem = ($cap===null) ? '—' : max($cap - $issued, 0);
            return '<table class="foop-vars-table"><thead><tr><th>Type</th><th>Capacity</th><th>Issued</th><th>Remaining</th></tr></thead><tbody>'.
                   '<tr><td>Event</td><td>'.($cap===null?'—':intval($cap)).'</td><td>'.intval($issued).'</td><td>'.$rem.'</td></tr>'.
                   '</tbody></table>';
        }

        $rows = '';
        foreach($product->get_children() as $vid){
            $v = wc_get_product($vid); if(!$v) continue;
            $atts = $v->get_attributes(); $labels=array();
            foreach($atts as $k=>$val){ $tax=(strpos($k,'attribute_')===0)?substr($k,10):$k; $labels[]=$this->human_attr_value($tax,$val); }
            $title = implode(' / ',$labels); if($title===''){ $title = '#'.$vid; }
            $cap  = $this->get_variation_capacity($vid);
            $issued = $this->get_ticket_count_for_variation($product_id,$vid,$from_ts,$to_ts);
            $rem = ($cap===null) ? '—' : max($cap - $issued, 0);
            $rows .= '<tr><td>'.esc_html($title).'</td><td>'.($cap===null?'—':intval($cap)).'</td><td>'.intval($issued).'</td><td>'.$rem.'</td></tr>';
        }
        return '<table class="foop-vars-table"><thead><tr><th>Variation</th><th>Capacity</th><th>Issued</th><th>Remaining</th></tr></thead><tbody>'.$rows.'</tbody></table>';
    }
    private function sl_is_event_product($product_id){
        return (
            get_post_meta($product_id, 'WooCommerceEvents', true) === 'yes'
            || get_post_meta($product_id, 'WooCommerceEventsDate', true)
            || get_post_meta($product_id, 'WooCommerceEventsType', true)
        );
    }
    private function sl_variation_total_sold($variation_id){
        $sold = (int) get_post_meta($variation_id, 'total_sales', true);
        return max(0, $sold);
    }
    private function get_variation_capacity($variation_id){
        $variation = wc_get_product($variation_id);
        if(!$variation) return null;
        foreach($this->capacity_meta_keys as $meta_key){
            $raw = get_post_meta($variation_id, $meta_key, true);
            if($raw !== '' && $raw !== null){
                return intval($raw);
            }
        }
        if(method_exists($variation, 'managing_stock') && $variation->managing_stock()){
            $q = $variation->get_stock_quantity();
            if($q !== null) return intval($q);
        }
        return null;
    }

    private function get_ticket_count_for_variation($product_id,$variation_id,$from_ts=null,$to_ts=null){
        $mq=array('relation'=>'AND',array('key'=>self::TICKET_PRODUCT_META,'value'=>intval($product_id)),array('key'=>'WooCommerceEventsVariationID','value'=>intval($variation_id)),);
        $args=array('post_type'=>self::TICKET_POST_TYPE,'post_status'=>array('publish','private'),'fields'=>'ids','posts_per_page'=>-1,'no_found_rows'=>true,'meta_query'=>$mq);
        if($from_ts||$to_ts){ $dq=array('inclusive'=>true); if($from_ts){ $dq['after']=date('Y-m-d H:i:s',$from_ts);} if($to_ts){ $dq['before']=date('Y-m-d H:i:s',$to_ts);} $args['date_query']=array($dq); }
        $q=new WP_Query($args); return is_array($q->posts)?count($q->posts):0;
    }
    private function get_ticket_count_for_product($product_id,$from_ts=null,$to_ts=null){
        $args=array('post_type'=>self::TICKET_POST_TYPE,'post_status'=>array('publish','private'),'fields'=>'ids','posts_per_page'=>-1,'no_found_rows'=>true,'meta_query'=>array(array('key'=>self::TICKET_PRODUCT_META,'value'=>intval($product_id))));
        if($from_ts||$to_ts){
            $dq=array('inclusive'=>true);
            if($from_ts){ $dq['after']=date('Y-m-d H:i:s',$from_ts);}
            if($to_ts){ $dq['before']=date('Y-m-d H:i:s',$to_ts);}
            $args['date_query']=array($dq);
        }
        $q=new WP_Query($args); return is_array($q->posts)?count($q->posts):0;
    }

    /* -------------------------------------------------
     * Registration shortcode + handler
     * ------------------------------------------------- */

    /**
     * Render the organiser registration form with optional defaults + errors.
     */
    private function render_registration_form($vals = array(), $errors = array()){
        $v = wp_parse_args($vals, array(
            'first_name' => '',
            'last_name'  => '',
            'email'      => '',
            'phone'      => '',
            'company'    => '',
        ));

        ob_start();
        echo '<div class="foop-wrap foop-reg">';
        if(!empty($errors)){
            echo '<div class="foop-card" style="border-color:#d63638;color:#d63638"><strong>There were problems:</strong><ul>';
            foreach($errors as $e){ echo '<li>'.esc_html($e).'</li>'; }
            echo '</ul></div>';
        }
        echo '<form method="post" action="" class="foop-register-form">';
        echo '<div class="foop-card foop-form-errors" style="display:none;border:1px solid #d63638;color:#d63638;border-radius:12px;padding:10px;margin-bottom:10px"></div>';
        wp_nonce_field('foop_register','foop_register_nonce');
        echo '<input type="hidden" name="foop_action" value="register_organizer">';
        echo '<div class="row">';
        echo '<div><label>First name *</label><input type="text" name="first_name" required value="'.esc_attr($v['first_name']).'"></div>';
        echo '<div><label>Last name *</label><input type="text" name="last_name" required value="'.esc_attr($v['last_name']).'"></div>';
        echo '</div>';
        echo '<div class="row">';
        echo '<div><label>Email *</label><input type="email" name="email" required value="'.esc_attr($v['email']).'"></div>';
        echo '<div><label>Telephone *</label><input type="text" name="phone" required value="'.esc_attr($v['phone']).'"></div>';
        echo '</div>';
        echo '<div class="row">';
        echo '<div><label>Company / Organiser name *</label><input type="text" name="company" required value="'.esc_attr($v['company']).'"></div>';
        echo '<div><label>Password *</label><input type="password" name="password" required minlength="8" pattern=".{8,}" autocomplete="new-password"><span class="help">Min 8 characters</span></div>';
        echo '</div>';
        echo '<p><button type="submit" class="foop-button">Register</button></p>';
        echo '</form></div>';
        return ob_get_clean();
    }

    public function shortcode_register($atts){
        if ( is_user_logged_in() ) {
            $allow_view = is_admin()
                || current_user_can('manage_options')
                || wp_doing_ajax()
                || ( defined('REST_REQUEST') && REST_REQUEST )
                || isset($_GET['preview'])
                || isset($_GET['elementor-preview'])
                || isset($_GET['fl_builder'])
                || isset($_GET['vc_editable']);
            if ( ! $allow_view && $this->current_user_is_organizer_like() ) {
                $dest = $this->portal_page_url();
                global $wp;
                $here = home_url( add_query_arg( array(), $wp->request ) );
                if ( untrailingslashit($dest) !== untrailingslashit($here) ) {
                    nocache_headers();
                    wp_safe_redirect( $dest, 302 );
                    exit;
                }
            }
        }
        return $this->render_registration_form();
    }

    public function maybe_handle_register_submit(){
        if(!isset($_POST['foop_action']) || $_POST['foop_action']!=='register_organizer') return;
        if(!isset($_POST['foop_register_nonce']) || !wp_verify_nonce($_POST['foop_register_nonce'],'foop_register')) return;

        $first = sanitize_text_field($_POST['first_name'] ?? '');
        $last  = sanitize_text_field($_POST['last_name'] ?? '');
        $email = sanitize_email($_POST['email'] ?? '');
        $phone = sanitize_text_field($_POST['phone'] ?? '');
        $company = sanitize_text_field($_POST['company'] ?? '');
        $pass  = (string)($_POST['password'] ?? '');

        $errs = array();
        if($first==='') $errs[]='First name is required.';
        if($last==='')  $errs[]='Last name is required.';
        if(!is_email($email)) $errs[]='A valid email is required.';
        if(strlen($pass) < 8) $errs[]='Password must be at least 8 characters.';
        if(email_exists($email)) $errs[]='An account with this email already exists.';

        if(!empty($errs)){
            $vals = array('first_name'=>$first,'last_name'=>$last,'email'=>$email,'phone'=>$phone,'company'=>$company);
            add_filter('the_content', function($c) use($vals,$errs){ return $this->render_registration_form($vals,$errs); });
            return;
        }

        $base = sanitize_user(current(explode('@',$email))); if($base==='') $base='organiser';
        $username = $base;
        $i = 1;
        while ( username_exists( $username ) ) {
            $username = $base . $i;
            $i++;
        }

        $user_id = wp_create_user( $username, $pass, $email );
        if ( is_wp_error( $user_id ) ) {
            $vals = array('first_name'=>$first,'last_name'=>$last,'email'=>$email,'phone'=>$phone,'company'=>$company);
            $errs = array('Something went wrong creating your account.');
            add_filter('the_content', function($c) use($vals,$errs){ return $this->render_registration_form($vals,$errs); });
            return;
        }

        $u = new WP_User( $user_id );
        $u->set_role( 'event_organizer' );

        wp_update_user( array(
            'ID'           => $user_id,
            'display_name' => trim( $first . ' ' . $last ),
            'first_name'   => $first,
            'last_name'    => $last,
        ) );

        update_user_meta( $user_id, 'foop_company', $company );
        update_user_meta( $user_id, 'foop_phone',   $phone );

        wp_set_current_user( $user_id );
        wp_set_auth_cookie( $user_id );
        $dest = add_query_arg(array(self::QV_TAB=>'create'), $this->portal_page_url());
        wp_safe_redirect( $dest );
        exit;
    }


			/* -------------------------------------------------
			 * CSV export
			 * ------------------------------------------------- */
			public function ajax_export_participants(){
				if ( ! is_user_logged_in() ) wp_die('Unauthorized', 401);
				if ( ! current_user_can(self::CAP_EXPORT_CSV) && ! current_user_can('administrator') ) wp_die('Forbidden', 403);

				$event_id = isset($_GET[self::QV_EVENT]) ? intval($_GET[self::QV_EVENT]) : 0;
				if (!$event_id) { $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0; }

				$nonce = isset($_GET['nonce']) ? sanitize_text_field($_GET['nonce']) : '';
				if (!$event_id || ! wp_verify_nonce($nonce, 'foop_export_'.$event_id)) wp_die('Bad request', 400);
				if (!$this->user_owns_event(get_current_user_id(), $event_id)) wp_die('Not allowed', 403);

				$from = isset($_GET[self::QV_FROM]) ? trim($_GET[self::QV_FROM]) : '';
				$to   = isset($_GET[self::QV_TO])   ? trim($_GET[self::QV_TO])   : '';
				$from = str_replace('/', '-', $from);
				$to   = str_replace('/', '-', $to);
				$from_ts = (preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) ? strtotime($from.' 00:00:00') : null;
				$to_ts   = (preg_match('/^\d{4}-\d{2}-\d{2}$/', $to))   ? strtotime($to.' 23:59:59')  : null;

				$tickets = $this->foop_get_tickets_for_event($event_id, $from_ts, $to_ts);

				$valid_ids = array((int) $event_id);
				if (function_exists('wc_get_product')) {
					$prod = wc_get_product($event_id);
					if ($prod && is_object($prod) && method_exists($prod, 'is_type') && $prod->is_type('variable')) {
						foreach ((array) $prod->get_children() as $cid) { $valid_ids[] = (int) $cid; }
					}
				}
				$valid_ids = array_values(array_unique(array_filter($valid_ids)));

				$merch_slugs = array();
				if (!empty($this->merch_category_slug)) $merch_slugs[] = $this->merch_category_slug;
				$merch_slugs[] = 'merchandise';

				$is_event_product = function($pid){
					return ( get_post_meta($pid, 'WooCommerceEvents', true) === 'yes' );
				};
				$is_merch = function($pid) use ($merch_slugs, $is_event_product){
					if (!$pid) return false;
					if (function_exists('has_term') && taxonomy_exists('product_cat')) {
						foreach ($merch_slugs as $slug) {
							if ($slug && has_term($slug, 'product_cat', $pid)) return true;
						}
					}
					return ! $is_event_product($pid);
				};
				$format_item_attrs = function($item){
					if (!is_object($item) || !method_exists($item, 'get_variation_attributes')) return '';
					$attrs = (array) $item->get_variation_attributes();
					if (empty($attrs)) return '';
					$bits = array();
					foreach ($attrs as $k => $v){
						$k = preg_replace('~^attribute_~','',$k);
						$k = preg_replace('~^pa_~','',$k);
						$k = ucwords(str_replace(array('-','_'),' ',$k));
						$v = is_scalar($v) ? (string)$v : '';
						$bits[] = $k . ': ' . sanitize_text_field(wp_strip_all_tags($v));
					}
					return $bits ? ' ('.implode(', ',$bits).')' : '';
				};

				// CSV columns (includes variation_label)
				$default_cols = array(
					'ticket_id',
					'attendee_name',
					'attendee_first_name',
					'attendee_last_name',
					'attendee_email',
					'attendee_phone',
					'distance',
					'variation_label',
					'ticket_type',
					'status',
					'order_id',
					'order_status',
					'check_in',
					'merchandise',
					'temp_license'
				);

				$custom_cols = array();
				$rows = array();

				foreach ($tickets as $tid){
					$meta = get_post_meta($tid);

					$t_prod = intval( $this->meta_value($meta, 'WooCommerceEventsProductID') );
					$t_var  = intval( $this->meta_value($meta, 'WooCommerceEventsVariationID') );
					if ( !in_array($t_prod, $valid_ids, true) && !($t_var && in_array($t_var, $valid_ids, true)) ) {
						continue;
					}

					$ticket_id_raw = $this->meta_value($meta,'WooCommerceEventsTicketID');
					$ticket_type   = $this->meta_value($meta,'WooCommerceEventsTicketType');

					// Distance + full variation label (unchanged behavior)
					$distance        = '';
					$variation_label = $ticket_type;
					if ($t_var && function_exists('wc_get_product')) {
						$v = wc_get_product($t_var);
						if ($v && is_object($v)) {
							$variation_label = wp_strip_all_tags( $v->get_name() );
							$dkm = get_post_meta($t_var, '_sl_distance_km', true);
							if ($dkm !== '' && $dkm !== null) {
								$num = (float) wc_format_decimal($dkm);
								if ($num > 0) {
									$distance = rtrim(rtrim(number_format($num, 2, '.', ''), '0'), '.') . 'km';
								}
							}
							if ($distance === '') {
								$atts = (array) $v->get_attributes();
								$raw  = isset($atts['attribute_distance'])
									? (string) $atts['attribute_distance']
									: ( $atts ? (string) reset($atts) : '' );
								if ($raw && preg_match('/([0-9]*\.?[0-9]+)\s*km/i', $raw, $m)) $distance = $m[1] . 'km';
							}
							if ($distance === '' && $variation_label && preg_match('/([0-9]*\.?[0-9]+)\s*km/i', $variation_label, $m)) {
								$distance = $m[1] . 'km';
							}
						}
					}
					if ($distance === '' && $ticket_type && preg_match('/([0-9]*\.?[0-9]+)\s*km/i', $ticket_type, $m)) {
						$distance = $m[1] . 'km';
					}
					if ($t_var && function_exists('wc_get_product')) {
						$v = wc_get_product($t_var);
						if ($v && is_object($v)) $variation_label = wp_strip_all_tags( $v->get_name() );
					}

					$row = array(
						'ticket_id'           => ($ticket_id_raw ? $ticket_id_raw : $tid),
						'attendee_name'       => $this->meta_value($meta,'WooCommerceEventsAttendeeName'),
						'attendee_first_name' => $this->meta_value($meta,'WooCommerceEventsAttendeeFirstName'),
						'attendee_last_name'  => $this->meta_value($meta,'WooCommerceEventsAttendeeLastName'),
						'attendee_email'      => $this->meta_value($meta,'WooCommerceEventsAttendeeEmail'),
						'attendee_phone'      => $this->meta_value($meta,'WooCommerceEventsAttendeeTelephone'),
						'distance'            => $distance,
						'variation_label'     => $variation_label,
						'ticket_type'         => $ticket_type,
						'status'              => $this->meta_value($meta,'WooCommerceEventsStatus'),
						'order_id'            => $this->meta_value($meta,'WooCommerceEventsOrderID'),
						'order_status'        => '',
						'check_in'            => $this->meta_value($meta,'WooCommerceEventsCheckIn'),
						'merchandise'         => '',
						'temp_license'        => 'No', // default to NO unless we have positive evidence
					);

					/* === TEMP LICENCE: per-attendee truth ===
					   Priority:
					   1) ticket meta _sl_attendee_temp_license (yes/no)
					   2) order item meta _sl_temp_lic_yes_idx -> contains 1-based attendee indexes
					   3) fallback inference from _sl_temp_licences (count) vs _qty for that order item
					   4) otherwise keep "No"
					*/
					$flag = get_post_meta( $tid, '_sl_attendee_temp_license', true ); // 'yes'|'no'|''
					error_log("SL Export Debug: ticket $tid, flag='$flag'");

					if ($flag !== '' && $flag !== null) {
						$row['temp_license'] = ( strtolower((string)$flag) === 'yes' || $flag === '1' ) ? 'Yes' : 'No';
						error_log("SL Export Debug: ticket $tid using direct flag: {$row['temp_license']}");
					} else {
						$order_item_id = (int) $this->meta_value($meta,'WooCommerceEventsOrderItemID');
						$att_idx       = (int) $this->meta_value($meta,'WooCommerceEventsAttendeeNumber'); // 1-based
						$mapped        = null;

						if ($order_item_id && function_exists('wc_get_order_item_meta')) {
							// 2) explicit list of yes-indexes
							$yes_raw = wc_get_order_item_meta( $order_item_id, '_sl_temp_lic_yes_idx', true );
							$yes_arr = is_array($yes_raw)
								? $yes_raw
								: preg_split('/[,\s]+/', (string) $yes_raw, -1, PREG_SPLIT_NO_EMPTY);
							$yes_arr = array_map('intval', (array) $yes_arr);

							error_log("SL Export Debug: ticket $tid fallback - order_item $order_item_id, att_idx $att_idx, yes_arr: " . print_r($yes_arr, true));

							if ($att_idx > 0 && !empty($yes_arr)) {
								$mapped = in_array($att_idx, $yes_arr, true);
								error_log("SL Export Debug: ticket $tid mapped via yes_arr: " . ($mapped ? 'true' : 'false'));
							} else {
								// 3) infer from totals if we can
								$yes_count = (int) wc_get_order_item_meta( $order_item_id, '_sl_temp_licences', true );
								$qty       = (int) wc_get_order_item_meta( $order_item_id, '_qty', true );

								error_log("SL Export Debug: ticket $tid infer - yes_count: $yes_count, qty: $qty");

								if ($qty <= 1) {
									$mapped = ($yes_count > 0);
								} elseif ($yes_count === 0) {
									$mapped = false;
								} elseif ($yes_count === $qty) {
									$mapped = true;
								}
								error_log("SL Export Debug: ticket $tid inferred mapped: " . ($mapped === null ? 'null' : ($mapped ? 'true' : 'false')));
							}
						}

						if ($mapped !== null) {
							$row['temp_license'] = $mapped ? 'Yes' : 'No';
						}
						// else: remain 'No' (no guesswork)
					}

					// order status + merchandise (unchanged)
					if (!empty($row['order_id']) && function_exists('wc_get_order')) {
						$order = wc_get_order($row['order_id']);
						if ($order){
							if (method_exists($order,'get_status')) {
								$row['order_status'] = $order->get_status();
							}
							$merch = array();
							if (method_exists($order,'get_items')) {
								foreach ($order->get_items('line_item') as $item){
									if (!is_object($item)) continue;
									$pid = (int) $item->get_product_id();
									$vid = (int) $item->get_variation_id();
									if ( in_array($pid,$valid_ids,true) || ($vid && in_array($vid,$valid_ids,true)) ) continue;
									if ( $is_merch($pid) ){
										$name  = $item->get_name();
										$attrs = $format_item_attrs($item);
										$qty   = (int) $item->get_quantity();
										$merch[] = trim($name.$attrs) . ' x' . $qty;
									}
								}
							}
							if ($merch){
								$row['merchandise'] = implode('; ', $merch);
							}
						}
					}

					// custom fields (unchanged)
					foreach ($meta as $k => $vals){
						if (strpos($k, self::CUSTOM_FIELD_PREFIX) === 0){
							if (!in_array($k,$custom_cols,true)) $custom_cols[] = $k;
							$row[$k] = maybe_unserialize($vals[0]);
						}
					}

					$rows[] = $row;
				}

				$filename = 'participants-event-'.$event_id.'-'.date('Ymd-His').'.csv';
				if (function_exists('nocache_headers')) nocache_headers();
				if (function_exists('ob_get_length') && ob_get_length()) { @ob_end_clean(); }

				header('Content-Type: text/csv; charset=utf-8');
				header('Content-Disposition: attachment; filename='.$filename);

				$out = fopen('php://output','w');
				$headers = array_merge($default_cols, $custom_cols);
				$pretty  = array_map(function($h){
					if (strpos($h, SL_Organiser_Portal::CUSTOM_FIELD_PREFIX) === 0){
						$label = substr($h, strlen(SL_Organiser_Portal::CUSTOM_FIELD_PREFIX));
						$label = str_replace('_',' ', $label);
						return 'custom: '.ucwords($label);
					}
					return $h;
				}, $headers);

				fputcsv($out, $pretty);
				foreach ($rows as $row){
					$line = array();
					foreach ($headers as $h){
						$line[] = isset($row[$h]) ? (is_array($row[$h]) ? json_encode($row[$h]) : $row[$h]) : '';
					}
					fputcsv($out, $line);
				}
				fclose($out);
				exit;
			}

    private function get_sales_for_product($product_id,$from_ts=null,$to_ts=null){ return $this->get_sales_for_products(array($product_id),$from_ts,$to_ts); }
    private function get_sales_for_products($product_ids,$from_ts=null,$to_ts=null){
        $product_ids=array_map('intval',(array)$product_ids); $statuses=array('processing','completed');
        $query=new WC_Order_Query(array('limit'=>-1,'status'=>$statuses,'return'=>'ids')); $order_ids=$query->get_orders();
        $totals=array('qty'=>0,'net'=>0.0,'tax'=>0.0,'gross'=>0.0,'orders'=>0);
        foreach($order_ids as $oid){ $order=wc_get_order($oid); if(!$order) continue;
            if($from_ts||$to_ts){ $created=$order->get_date_created(); $ts=$created?$created->getTimestamp():0; if($from_ts && $ts<$from_ts) continue; if($to_ts && $ts>$to_ts) continue; }
            $include=false;
            foreach($order->get_items() as $item){
                $pid=$item->get_product_id(); if(!$pid) continue;
                if(in_array($pid,$product_ids,true)){
                    $qty=(int)$item->get_quantity(); 
					$line_total=(float)$item->get_total(); 
					$line_tax=(float)$item->get_total_tax();
                    $totals['qty']+=$qty; 
					$totals['net']+=$line_total; 
					$totals['tax']+=$line_tax; 
					$totals['gross']+=($line_total+$line_tax); 
					$include=true;
                }
            }
		    
			// ALSO include "Temporary licence" fees attached to these products
			foreach ( $order->get_fees() as $fee_item ) {
				$is_temp = ( stripos( $fee_item->get_name(), 'Temporary licence' ) === 0 )
						   || ( (int) $fee_item->get_meta('_sl_temp_license') === 1 );

				if ( ! $is_temp ) continue;

				$fee_pid = (int) $fee_item->get_meta('_sl_temp_license_pid');

				// Prefer explicit pid meta. If absent, include as long as the order had a matching product.
				if ( $fee_pid && ! in_array( $fee_pid, $product_ids, true ) ) {
					continue;
				}

				$f_total = (float) $fee_item->get_total();
				$f_tax   = (float) $fee_item->get_total_tax();

				$totals['net']   += $f_total;
				$totals['tax']   += $f_tax;
				$totals['gross'] += ( $f_total + $f_tax );

				$include = true; // make sure this order is counted
			}
									
            if($include){ $totals['orders']+=1; }
        }
        $totals['net']=wc_format_decimal($totals['net'],2); $totals['tax']=wc_format_decimal($totals['tax'],2); $totals['gross']=wc_format_decimal($totals['gross'],2);
        return $totals;
    }

    private function user_owns_event($user_id,$product_id){
        $owners=(array)get_post_meta($product_id,self::PRODUCT_ORGANIZERS_META,true); $owners=array_map('intval',$owners);
        return in_array(intval($user_id),$owners,true) || current_user_can('administrator');
    }

    private function get_tickets_for_product($product_id,$from_ts=null,$to_ts=null){
        $args=array('post_type'=>self::TICKET_POST_TYPE,'post_status'=>array('publish','private'),'fields'=>'ids','posts_per_page'=>-1,'no_found_rows'=>true,'meta_query'=>array(array('key'=>self::TICKET_PRODUCT_META,'value'=>intval($product_id))));
        if($from_ts||$to_ts){
            $dq=array('inclusive'=>true);
            if($from_ts){ $dq['after']=date('Y-m-d H:i:s',$from_ts);}
            if($to_ts){ $dq['before']=date('Y-m-d H:i:s',$to_ts);}
            $args['date_query']=array($dq);
        }
        $q=new WP_Query($args); return $q->posts;
    }

    /* -------------------------------------------------
     * Page rendering & shortcodes
     * ------------------------------------------------- */
    public function maybe_replace_portal_page_content($content){
        if ($this->is_portal_page()) return $this->render_portal_html();
        return $content;
    }

    private function render_portal_html($active_tab = null, $errors=array(), $success=array()){
        if(!function_exists('wc_get_product')) return '<div class="foop-error">WooCommerce is required.</div>';
        if(!$this->current_user_is_organizer_like()) return '<div class="foop-error">You do not have permission to view this portal.</div>';
        $tab = $active_tab ? $active_tab : sanitize_text_field($_GET[self::QV_TAB] ?? 'dashboard');

        ob_start();
        echo '<div class="foop-grid">';
        echo '<div class="foop-sidenav"><h4>Menu</h4>';
        $dash_url   = add_query_arg(array(self::QV_TAB=>'dashboard'), $this->portal_page_url());
        $create_url = add_query_arg(array(self::QV_TAB=>'create'),    $this->portal_page_url());
        $profile_url= add_query_arg(array(self::QV_TAB=>'profile'),   $this->portal_page_url());
        echo '<a class="'.($tab==='dashboard'?'active':'').'" href="'.esc_url($dash_url).'">Dashboard</a>';
        echo '<a class="'.($tab==='create'?'active':'').'" href="'.esc_url($create_url).'">Create Event</a>';
        echo '<a class="'.($tab==='profile'?'active':'').'" href="'.esc_url($profile_url).'">Profile</a>';
        echo '</div>';

        echo '<div>';
        if($tab==='create'){
            echo $this->render_create_event_form($errors,$success);
        } elseif($tab==='profile'){
            echo $this->render_profile_form($errors,$success);
        } else {
            echo $this->render_dashboard_html();
        }
        echo '<p style="opacity:.6;margin-top:1rem">Starting Line Organiser Portal v'.esc_html(self::VERSION).'</p>';
        echo '</div>';
        echo '</div>';
        return ob_get_clean();
    }

    public function shortcode_dashboard($atts){
        return $this->render_portal_html();
    }

    /* -------------------------------------------------
     * Request-change handler (AJAX)
     * ------------------------------------------------- */
    public function ajax_request_change(){
        if(!is_user_logged_in()) wp_send_json_error('Not authorized', 401);

        $nonce = isset($_POST['nonce']) ? sanitize_text_field($_POST['nonce']) : '';
        if(!wp_verify_nonce($nonce, 'foop_ajax')) wp_send_json_error('Bad nonce', 400);

        $event_id = isset($_POST['event_id']) ? intval($_POST['event_id']) : 0;
        if(!$event_id || !$this->user_owns_event(get_current_user_id(), $event_id)){
            wp_send_json_error('You do not have permission for this event.', 403);
        }

        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'other';
        $message = isset($_POST['message']) ? wp_kses_post($_POST['message']) : '';

        $commentdata = array(
            'comment_post_ID' => $event_id,
            'comment_author'  => wp_get_current_user()->display_name,
            'comment_author_email' => wp_get_current_user()->user_email,
            'comment_content' => "[Organiser Request: {$type}]\n".$message,
            'comment_type'    => 'foop_request_change',
            'comment_approved'=> 0,
            'user_id'         => get_current_user_id(),
        );
        $cid = wp_insert_comment($commentdata);

        $admin_email = get_option('admin_email');
        $subject = sprintf('Organiser request on event #%d', $event_id);
        $body = "An organiser submitted a request.\n\nEvent ID: {$event_id}\nType: {$type}\nUser: ".wp_get_current_user()->user_email."\n\nMessage:\n{$message}\n\n";
        @wp_mail($admin_email, $subject, $body);

        wp_send_json_success('Your request has been sent to the admins.');
    }

		/**
	 * AJAX: add a simple merch product to the cart (used on checkout).
	 */
	public function ajax_add_merch_to_cart(){
		check_ajax_referer('foop_merch','nonce');
		if ( ! WC()->cart ) wp_send_json_error('Cart unavailable.');

		$pid = isset($_POST['pid']) ? intval($_POST['pid']) : 0;
		if (!$pid) wp_send_json_error('Bad product.');

		$p = wc_get_product($pid);
		if (!$p || !$p->is_purchasable()) wp_send_json_error('Product unavailable.');
		if ($p->is_type('variable'))      wp_send_json_error('Options required.');

		$added = WC()->cart->add_to_cart($pid, 1);
		if (!$added) wp_send_json_error('Not added.');
		wp_send_json_success(array('ok'=>true));
	}
	
    /**
     * Return ticket post IDs for a single event (product) INCLUDING its variations.
     * Respects optional date range on the ticket post_date (created/issued date).
     */
    private function foop_get_tickets_for_event( $event_product_id, $from_ts = null, $to_ts = null ) {
        $event_product_id = intval( $event_product_id );
        if ( ! $event_product_id ) return array();

        $ids = array( $event_product_id );
        if ( function_exists( 'wc_get_product' ) ) {
            $prod = wc_get_product( $event_product_id );
            if ( $prod && $prod->is_type( 'variable' ) ) {
                $ids = array_merge( $ids, $prod->get_children() );
            }
        }
        $ids = array_unique( array_filter( array_map( 'intval', $ids ) ) );

        $date_query = array();
        if ( $from_ts ) {
            $date_query[] = array( 'column' => 'post_date', 'after'  => date( 'Y-m-d H:i:s', $from_ts ), 'inclusive' => true );
        }
        if ( $to_ts ) {
            $date_query[] = array( 'column' => 'post_date', 'before' => date( 'Y-m-d H:i:s', $to_ts ),  'inclusive' => true );
        }

        $ticket_cpt = 'event_magic_tickets';

        $q = new WP_Query( array(
            'post_type'      => $ticket_cpt,
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
            'date_query'     => $date_query,
            'meta_query'     => array(
                'relation' => 'OR',
                array(
                    'key'     => 'WooCommerceEventsProductID',
                    'value'   => $ids,
                    'compare' => 'IN',
                ),
                array(
                    'key'     => 'WooCommerceEventsVariationID',
                    'value'   => $ids,
                    'compare' => 'IN',
                ),
            ),
        ) );

        return $q->posts ? array_map( 'intval', $q->posts ) : array();
    }
}
/* end class */

SL_Organiser_Portal::init();
}