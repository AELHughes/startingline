<?php
/**
 * Functions for dark mode.
 *
 * @package Thewebs
 */

namespace Thewebs_Pro;

use function Thewebs\thewebs;
use function Thewebs\render_custom_logo;
use function is_customize_preview;


/**
 * Output Dark mode Mobile Logo.
 */
function dark_mode_mobile_logo() {
	if ( thewebs()->option( 'dark_mode_enable' ) && thewebs()->option( 'dark_mode_custom_logo' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		if ( thewebs()->option( 'dark_mode_custom_mobile_logo' ) ) {
			render_custom_logo( 'dark_mode_mobile_logo', 'thewebs-dark-mode-logo' );
		} else {
			render_custom_logo( 'dark_mode_logo', 'thewebs-dark-mode-logo' );
		}
	}
}
add_action( 'before_thewebs_mobile_logo_output', 'Thewebs_Pro\dark_mode_mobile_logo' );

/**
 * Output Darkmode Logo.
 */
function dark_mode_logo() {
	if ( thewebs()->option( 'dark_mode_enable' ) && thewebs()->option( 'dark_mode_custom_logo' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		render_custom_logo( 'dark_mode_logo', 'thewebs-dark-mode-logo' );
	}
}
add_action( 'before_thewebs_logo_output', 'Thewebs_Pro\dark_mode_logo' );

/**
 * Output Darkmode Learndash Logo.
* @param string $header_element Focus mode header element markup.
 * @param array  $header         Array of header element details keyed logo_alt, logo_url, text, text_url.
 * @param int    $course_id      Course ID.
 * @param int    $user_id        User ID.
 */
function learndash_focus_dark_mode_logo( $header_element, $header, $course_id, $user_id ) {
	if ( thewebs()->option( 'dark_mode_enable' ) && thewebs()->option( 'dark_mode_learndash_enable' ) && thewebs()->option( 'dark_mode_learndash_lesson_logo' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		ob_start();
		echo '<a class="brand thewebs-dark-mode-logo-link" href="' . esc_url( apply_filters( 'thewebs_logo_url', home_url( '/' ) ) ) . '" rel="home" aria-label="' . esc_attr( get_bloginfo( 'name' ) ) . '">';
		render_custom_logo( 'dark_mode_learndash_lesson_logo', 'thewebs-dark-mode-logo' );
		echo '</a>';
		$darkmode_logo = ob_get_clean();
		$header_element = $header_element . $darkmode_logo;
	}
	return $header_element;
}
add_filter( 'learndash_focus_header_element', 'Thewebs_Pro\learndash_focus_dark_mode_logo', 20, 4 );
/**
 * Output Header Switch.
 */
function header_color_switcher() {
	if ( thewebs()->option( 'dark_mode_enable' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		echo '<div class="thewebs-color-palette-header-switcher">';
		echo output_color_switcher( thewebs()->option( 'header_dark_mode_switch_type' ), thewebs()->option( 'header_dark_mode_switch_style' ), thewebs()->option( 'header_dark_mode_light_icon' ), thewebs()->option( 'header_dark_mode_dark_icon' ), thewebs()->option( 'header_dark_mode_light_switch_title' ), thewebs()->option( 'header_dark_mode_dark_switch_title' ), thewebs()->option( 'header_dark_mode_switch_tooltip' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}
add_action( 'thewebs_header_dark_mode', 'Thewebs_Pro\header_color_switcher' );
/**
 * Output Mobile Switch.
 */
function mobile_color_switcher() {
	if ( thewebs()->option( 'dark_mode_enable' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		echo '<div class="thewebs-color-palette-mobile-switcher">';
		echo output_color_switcher( thewebs()->option( 'mobile_dark_mode_switch_type' ), thewebs()->option( 'mobile_dark_mode_switch_style' ), thewebs()->option( 'mobile_dark_mode_light_icon' ), thewebs()->option( 'mobile_dark_mode_dark_icon' ), thewebs()->option( 'mobile_dark_mode_light_switch_title' ), thewebs()->option( 'mobile_dark_mode_dark_switch_title' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}
add_action( 'thewebs_mobile_dark_mode', 'Thewebs_Pro\mobile_color_switcher' );
/**
 * Output Footer Switch.
 */
function footer_color_switcher() {
	if ( thewebs()->option( 'dark_mode_enable' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		echo '<div class="thewebs-color-palette-footer-switcher">';
		echo output_color_switcher( thewebs()->option( 'footer_dark_mode_switch_type' ), thewebs()->option( 'footer_dark_mode_switch_style' ), thewebs()->option( 'footer_dark_mode_light_icon' ), thewebs()->option( 'footer_dark_mode_dark_icon' ), thewebs()->option( 'footer_dark_mode_light_switch_title' ), thewebs()->option( 'footer_dark_mode_dark_switch_title' ), thewebs()->option( 'footer_dark_mode_switch_tooltip' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}
add_action( 'thewebs_footer_dark_mode', 'Thewebs_Pro\footer_color_switcher' );
/**
 * Output Fixed Switch.
 */
function fixed_color_switcher() {
	if ( thewebs()->option( 'dark_mode_enable' ) && thewebs()->option( 'dark_mode_switch_show' ) && apply_filters( 'thewebs_dark_mode_enable', true ) ) {
		echo '<div class="thewebs-color-palette-fixed-switcher kcpf-position-' . esc_attr( thewebs()->option( 'dark_mode_switch_position' ) ) . ' vs-lg-' . ( thewebs()->sub_option( 'dark_mode_switch_visibility', 'desktop' ) ? 'true' : 'false' ) . ' vs-md-' . ( thewebs()->sub_option( 'dark_mode_switch_visibility', 'tablet' ) ? 'true' : 'false' ) . ' vs-sm-' . ( thewebs()->sub_option( 'dark_mode_switch_visibility', 'mobile' ) ? 'true' : 'false' ) . '">';
		echo output_color_switcher( thewebs()->option( 'dark_mode_switch_type' ), thewebs()->option( 'dark_mode_switch_style' ), thewebs()->option( 'dark_mode_light_icon' ), thewebs()->option( 'dark_mode_dark_icon' ), thewebs()->option( 'dark_mode_light_switch_title' ), thewebs()->option( 'dark_mode_dark_switch_title' ), thewebs()->option( 'dark_mode_switch_tooltip' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}
add_action( 'wp_footer', 'Thewebs_Pro\fixed_color_switcher' );
/**
 * Output Header Switch.
 */
function header_learndash_color_switcher() {
	if ( thewebs()->option( 'dark_mode_enable' ) && thewebs()->option( 'dark_mode_learndash_enable' ) ) {
		echo '<div class="thewebs-color-palette-header-switcher">';
		echo output_color_switcher( thewebs()->option( 'header_dark_mode_switch_type' ), thewebs()->option( 'header_dark_mode_switch_style' ), thewebs()->option( 'header_dark_mode_light_icon' ), thewebs()->option( 'header_dark_mode_dark_icon' ), thewebs()->option( 'header_dark_mode_light_switch_title' ), thewebs()->option( 'header_dark_mode_dark_switch_title' ), thewebs()->option( 'header_dark_mode_switch_tooltip' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}
add_action( 'learndash-focus-header-usermenu-after', 'Thewebs_Pro\header_learndash_color_switcher' );
/**
 * Output Switch.
 */
function output_color_switcher( $type = 'icon', $style = 'button', $light_icon = 'sun', $dark_icon = 'moon', $light_text = 'Light', $dark_text = 'Dark', $tooltip = false ) {
	echo '<div class="thewebs-color-palette-switcher kcps-style-' . esc_attr( $style ) . ' kcps-type-' . esc_attr( $type ) . '">';
	echo '<button class="thewebs-color-palette-toggle thewebs-color-toggle" aria-label="' . esc_attr__( 'Change site color palette', 'thewebs-pro' ) . '">';
	switch ( $type ) {
		case 'text':
			echo '<span class="thewebs-color-palette-light">';
				echo '<span class="thewebs-color-palette-label">';
					echo esc_html( $light_text );
				echo '</span>';
			echo '</span>';
			echo '<span class="thewebs-color-palette-dark">';
				echo '<span class="thewebs-color-palette-label">';
					echo esc_html( $dark_text );
				echo '</span>';
			echo '</span>';
			break;
		case 'both':
			echo '<span class="thewebs-color-palette-light">';
				echo '<span class="thewebs-color-palette-icon">';
				thewebs()->print_icon( $light_icon, $light_text );
				echo '</span>';
				echo '<span class="thewebs-color-palette-label">';
					echo esc_html( $light_text );
				echo '</span>';
			echo '</span>';
			echo '<span class="thewebs-color-palette-dark">';
				echo '<span class="thewebs-color-palette-icon">';
				thewebs()->print_icon( $dark_icon, $dark_text );
				echo '</span>';
				echo '<span class="thewebs-color-palette-label">';
					echo esc_html( $dark_text );
				echo '</span>';
			echo '</span>';
			break;
		default:
			echo '<span class="thewebs-color-palette-light"' . ( $tooltip ? 'data-tooltip-drop="' . esc_attr( $light_text ) . '"' : '' ) . '>';
				echo '<span class="thewebs-color-palette-icon">';
				thewebs()->print_icon( $light_icon, $light_text );
				echo '</span>';
			echo '</span>';
			echo '<span class="thewebs-color-palette-dark"' . ( $tooltip ? 'data-tooltip-drop="' . esc_attr( $dark_text ) . '"' : '' ) . '>';
				echo '<span class="thewebs-color-palette-icon">';
				thewebs()->print_icon( $dark_icon, $dark_text );
				echo '</span>';
			echo '</span>';
			break;
	}
	echo '</button>';
	echo '</div>';
}
