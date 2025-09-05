<?php
/**
 * Thewebs functions and definitions
 *
 * This file must be parseable by PHP 5.2.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package thewebs
 */

 function my_theme_enqueue_scripts() {
    // Enqueue your script
    wp_enqueue_style('my-styles', get_template_directory_uri().'/noun/assets/css/codecreator.css');
    wp_enqueue_script('my-script', get_template_directory_uri() . '/noun/assets/js/src/codecreator.js', array('jquery'), '1.0', true);
}
add_action('wp_enqueue_scripts', 'my_theme_enqueue_scripts');