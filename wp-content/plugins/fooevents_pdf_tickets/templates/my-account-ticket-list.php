<?php
/**
 * Ticket listing template - My Account
 *
 * @link https://www.fooevents.com
 * @package fooevents-pdf-tickets
 */

?>
<h1><?php esc_attr_e( 'Tickets', 'fooevents-pdf-tickets' ); ?></h1>
<table>
<?php foreach ( $tickets as $ticket ) : ?>
	<?php $product_id = get_post_meta( $ticket->ID, 'WooCommerceEventsProductID', true ); ?>  
	<?php $woocommerce_events_ticket_id = get_post_meta( $ticket->ID, 'WooCommerceEventsTicketID', true ); ?>
	<?php $woocommerce_events_ticket_hash = get_post_meta( $ticket->ID, 'WooCommerceEventsTicketHash', true ); ?>
	<?php $ticket_path = ''; ?>
	<?php if ( ! empty( $woocommerce_events_ticket_hash ) ) : ?>
		<?php $ticket_path = $this->config->pdf_ticket_url . $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_hash . '-' . $woocommerce_events_ticket_id . '.pdf'; ?>
	<?php else : ?>
		<?php $ticket_path = $this->config->pdf_ticket_url . $woocommerce_events_ticket_id . '-' . $woocommerce_events_ticket_id . '.pdf'; ?>
	<?php endif; ?>
	<tr>
		<td><?php echo esc_attr( $ticket->post_title ); ?></td>
		<td><?php echo esc_attr( get_the_title( $product_id ) ); ?></td>
		<td><a href="<?php echo esc_attr( $ticket_path ); ?>" target="_BLANK"><?php esc_attr_e( 'Download', 'fooevents-pdf-tickets' ); ?></a></td>
	</tr>
<?php endforeach; ?>
</table>
