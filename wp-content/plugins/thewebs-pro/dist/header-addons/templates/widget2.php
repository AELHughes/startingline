<?php
/**
 * Template part for displaying the header Widget 2
 *
 * @package thewebs_pro
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;

$link_style = ( thewebs()->option( 'header_widget2_link_style' ) ? thewebs()->option( 'header_widget2_link_style' ) : 'plain' );
?>
<aside class="widget-area site-header-item site-header-focus-item header-widget2 header-widget-lstyle-<?php echo esc_attr( $link_style ); ?>" data-section="sidebar-widgets-header2">
	<div class="header-widget-area-inner site-info-inner">
		<?php
		dynamic_sidebar( 'header2' );
		?>
	</div>
</aside><!-- .header-widget2 -->
