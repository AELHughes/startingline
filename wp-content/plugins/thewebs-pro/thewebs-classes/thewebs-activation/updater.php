<?php
/**
 * Class file to check for active license
 *
 * @package Thewebs Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load activation API.
require_once KTP_PATH . 'dist/dashboard/class-thewebs-pro-dashboard.php';
if ( is_multisite() ) {
	$show_local_activation = apply_filters( 'thewebs_activation_individual_multisites', false );
	if ( $show_local_activation ) {
		if ( 'Activated' === get_option( 'thewebs_pro_api_manager_activated' ) ) {
			$thewebs_pro_updater = Thewebs_Update_Checker::buildUpdateChecker( 'https://kernl.us/api/v1/updates/5eee71ef08f6d93d2b905870/', KTP_PATH . 'thewebs-pro.php', 'thewebs-pro' );
		}
	} else {
		if ( 'Activated' === get_site_option( 'thewebs_pro_api_manager_activated' ) ) {
			$thewebs_pro_updater = Thewebs_Update_Checker::buildUpdateChecker( 'https://kernl.us/api/v1/updates/5eee71ef08f6d93d2b905870/', KTP_PATH . 'thewebs-pro.php', 'thewebs-pro' );
		}
	}
} 
// elseif ( 'Activated' === get_option( 'thewebs_pro_api_manager_activated' ) ) {
// 	$thewebs_pro_updater = Thewebs_Update_Checker::buildUpdateChecker( 'https://kernl.us/api/v1/updates/5eee71ef08f6d93d2b905870/', KTP_PATH . 'thewebs-pro.php', 'thewebs-pro' );
// }
