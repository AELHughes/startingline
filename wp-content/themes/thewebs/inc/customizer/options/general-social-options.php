<?php
/**
 * Header Builder Options
 *
 * @package Thewebs
 */

namespace Thewebs;

use Thewebs\Theme_Customizer;
use function Thewebs\thewebs;
ob_start(); ?>
<div class="thewebs-compontent-description">
<h2><?php echo esc_html__( 'Social Network Links', 'thewebs' ); ?></h2>
</div>
<?php
$compontent_description = ob_get_clean();
$settings = array(
	'social_settings' => array(
		'control_type' => 'thewebs_blank_control',
		'section'      => 'general_social',
		'settings'     => false,
		'priority'     => 1,
		'description'  => $compontent_description,
	),
	'facebook_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'facebook_link' ),
		'label'        => esc_html__( 'Facebook', 'thewebs' ),
	),
	'twitter_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'twitter_link' ),
		'label'        => esc_html__( 'Twitter', 'thewebs' ),
	),
	'instagram_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'instagram_link' ),
		'label'        => esc_html__( 'Instagram', 'thewebs' ),
	),
	'youtube_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'youtube_link' ),
		'label'        => esc_html__( 'YouTube', 'thewebs' ),
	),
	'vimeo_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'vimeo_link' ),
		'label'        => esc_html__( 'Vimeo', 'thewebs' ),
	),
	'facebook_group_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'facebook_group_link' ),
		'label'        => esc_html__( 'Facebook Group', 'thewebs' ),
	),
	'pinterest_link' => array(
		'control_type' => 'thewebs_text_control',
		'sanitize'     => 'esc_url_raw',
		'section'      => 'general_social',
		'default'      => thewebs()->default( 'pinterest_link' ),
		'label'        => esc_html__( 'Pinterest', 'thewebs' ),
	),
	'linkedin_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'linkedin_link' ),
		'label'        => esc_html__( 'Linkedin', 'thewebs' ),
	),
	'dribbble_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'dribbble_link' ),
		'label'        => esc_html__( 'Dribbble', 'thewebs' ),
	),
	'behance_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'behance_link' ),
		'label'        => esc_html__( 'Behance', 'thewebs' ),
	),
	'patreon_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'patreon_link' ),
		'label'        => esc_html__( 'Patreon', 'thewebs' ),
	),
	'reddit_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'reddit_link' ),
		'label'        => esc_html__( 'Reddit', 'thewebs' ),
	),
	'medium_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'medium_link' ),
		'label'        => esc_html__( 'medium', 'thewebs' ),
	),
	'wordpress_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'wordpress_link' ),
		'label'        => esc_html__( 'WordPress', 'thewebs' ),
	),
	'github_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'github_link' ),
		'label'        => esc_html__( 'GitHub', 'thewebs' ),
	),
	'vk_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'vk_link' ),
		'label'        => esc_html__( 'VK', 'thewebs' ),
	),
	'xing_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'xing_link' ),
		'label'        => esc_html__( 'Xing', 'thewebs' ),
	),
	'rss_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'rss_link' ),
		'label'        => esc_html__( 'RSS', 'thewebs' ),
	),
	'google_reviews_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'google_reviews_link' ),
		'label'        => esc_html__( 'Google Reviews', 'thewebs' ),
	),
	'yelp_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'yelp_link' ),
		'label'        => esc_html__( 'Yelp', 'thewebs' ),
	),
	'trip_advisor_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'trip_advisor_link' ),
		'label'        => esc_html__( 'Trip Advisor', 'thewebs' ),
	),
	'imdb_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'imdb_link' ),
		'label'        => esc_html__( 'IMDB', 'thewebs' ),
	),
	'whatsapp_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'whatsapp_link' ),
		'label'        => esc_html__( 'WhatsApp', 'thewebs' ),
	),
	'telegram_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'telegram_link' ),
		'label'        => esc_html__( 'Telegram', 'thewebs' ),
	),
	'soundcloud_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'soundcloud_link' ),
		'label'        => esc_html__( 'SoundCloud', 'thewebs' ),
	),
	'tumblr_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'tumblr_link' ),
		'label'        => esc_html__( 'Tumblr', 'thewebs' ),
	),
	'tiktok_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'tiktok_link' ),
		'label'        => esc_html__( 'Tiktok', 'thewebs' ),
	),
	'discord_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'discord_link' ),
		'label'        => esc_html__( 'Discord', 'thewebs' ),
	),
	'spotify_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'spotify_link' ),
		'label'        => esc_html__( 'Spotify', 'thewebs' ),
	),
	'apple_podcasts_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'apple_podcasts_link' ),
		'label'        => esc_html__( 'Apple Podcast', 'thewebs' ),
	),
	'flickr_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'flickr_link' ),
		'label'        => esc_html__( 'Flickr', 'thewebs' ),
	),
	'500px_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( '500px_link' ),
		'label'        => esc_html__( '500PX', 'thewebs' ),
	),
	'bandcamp_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'bandcamp_link' ),
		'label'        => esc_html__( 'Bandcamp', 'thewebs' ),
	),
	'anchor_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'anchor_link' ),
		'label'        => esc_html__( 'Anchor', 'thewebs' ),
	),
	'email_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'sanitize_text_field',
		'default'      => thewebs()->default( 'email_link' ),
		'label'        => esc_html__( 'Email', 'thewebs' ),
	),
	'phone_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'sanitize_text_field',
		'default'      => thewebs()->default( 'phone_link' ),
		'label'        => esc_html__( 'Phone', 'thewebs' ),
	),
	'custom1_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'custom1_link' ),
		'label'        => esc_html__( 'Custom 1', 'thewebs' ),
	),
	'custom2_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'custom2_link' ),
		'label'        => esc_html__( 'Custom 2', 'thewebs' ),
	),
	'custom3_link' => array(
		'control_type' => 'thewebs_text_control',
		'section'      => 'general_social',
		'sanitize'     => 'esc_url_raw',
		'default'      => thewebs()->default( 'custom3_link' ),
		'label'        => esc_html__( 'Custom 3', 'thewebs' ),
	),
);

Theme_Customizer::add_settings( $settings );

