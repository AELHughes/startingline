<?php
/**
 * Template part for displaying the header HTML2 Modual
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;

$link_style = ( thewebs()->option( 'header_widget1_link_style' ) ? thewebs()->option( 'header_widget1_link_style' ) : 'normal' );
?>
<aside class="widget-area site-header-item site-header-focus-item header-widget1 header-widget-lstyle-<?php echo esc_attr( $link_style ); ?>" data-section="sidebar-widgets-header1">
	<div class="header-widget-area-inner site-info-inner">
		<?php
		dynamic_sidebar( 'header1' );
		?>
	</div>
</aside><!-- .header-widget1 -->
