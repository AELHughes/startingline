<?php
/**
 * Google Map event tab template
 *
 * @link https://www.fooevents.com
 * @package woocommerce_events
 */

?>
<h2><?php esc_attr_e( 'Description', 'woocommerce-events' ); ?></h2>
<p><?php echo wp_kses_post( $event_content ); ?></p>
<?php if ( ! empty( $woocommerce_events_google_maps ) && ! empty( $global_woocommerce_events_google_maps_api_key ) ) : ?>
	<div id="google-map-holder" style="width: 100%; height: 400px;"></div>
	<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo esc_attr( $global_woocommerce_events_google_maps_api_key ); ?>&v=3.exp&callback=Function.prototype"></script>
	<script>
	function initialize_fooevents_google_map() {
	var mapOptions = {
	zoom: 14,
	center: new google.maps.LatLng(<?php echo esc_attr( $woocommerce_events_google_maps ); ?>),
	scrollwheel: false, 
	mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(document.getElementById('google-map-holder'),
									mapOptions);

	var image = '<?php echo esc_attr( plugins_url() ); ?>/fooevents/images/pin.png';
	var myLatLng = new google.maps.LatLng(<?php echo esc_attr( $woocommerce_events_google_maps ); ?>);
	var beachMarker = new google.maps.Marker({
	position: myLatLng,
	map: map,
	icon: image
	});

	}
	window.addEventListener("load", initialize_fooevents_google_map);
	</script>
<?php endif; ?>
