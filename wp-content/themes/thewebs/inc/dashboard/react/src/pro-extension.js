/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
const { Fragment } = wp.element;
const { withFilters } = wp.components;
const lockIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
<path d="M34 23h-2v-4c0-3.9-3.1-7-7-7s-7 3.1-7 7v4h-2v-4c0-5 4-9 9-9s9 4 9 9v4z"></path>
<path d="M33 40H17c-1.7 0-3-1.3-3-3V25c0-1.7 1.3-3 3-3h16c1.7 0 3 1.3 3 3v12c0 1.7-1.3 3-3 3zM17 24c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h16c.6 0 1-.4 1-1V25c0-.6-.4-1-1-1H17z"></path>
<circle cx="25" cy="28" r="2"></circle>
<path d="M25.5 28h-1l-1 6h3z"></path>
</svg>;
/**
 * Internal block libraries
 */
import map from 'lodash/map';

export const ProModules = () => {
	const proLinks = [
		{
			title: __( 'Header Addons', 'thewebs' ),
			description: __( 'Adds 19 elements to the header builder.', 'thewebs' ),
			setting: 'header_addon',
		},
		{
			title: __( 'Ultimate Menu', 'thewebs' ),
			description: __( 'Adds menu options for mega menus, highlight tags, icons and more.', 'thewebs' ),
			setting: 'mega_menu',
		},
		{
			title: __( 'Header/Footer Scripts', 'thewebs' ),
			description: __( 'Adds Options into the customizer to add header and footer scripts', 'thewebs' ),
			setting: 'scripts',
		},
		{
			title: __( 'Hooked Elements', 'thewebs' ),
			description: __( 'Add content anywhere into your site conditionally.', 'thewebs' ),
			setting: 'hooks',
		},
		{
			title: __( 'WooCommerce Addons', 'thewebs' ),
			description: __( 'Adds new options into the customizer for WooCommerce stores.', 'thewebs' ),
			setting: 'woocommerce',
		},
		{
			title: __( 'Infinite Scroll', 'thewebs' ),
			description: __( 'Adds Infinite Scroll for archives.', 'thewebs' ),
			setting: 'infinite_scroll',
		},
		{
			title: __( 'Local Gravatars', 'thewebs' ),
			description: __( 'Loads Gravatars from your servers to improve site performance.', 'thewebs' ),
			setting: 'local_gravatars',
		},
		{
			title: __( 'Archive Custom Page Title Backgrounds', 'thewebs' ),
			description: __( 'Allows you to assign a custom image for a taxonomy background.', 'thewebs' ),
			setting: 'archive_custom',
		},
	];
	return (
		<Fragment>
			<h2 className="section-header">{ __( 'Do more with the Thewebs Pro Addon', 'thewebs' ) }</h2>
			<div className="two-col-grid">
				{ map( proLinks, ( link ) => {
					return (
						<div className="link-item locked-item">
							<span className="lock-icon">{ lockIcon }</span>
							<h4>{ link.title }</h4>
							<p>{ link.description }</p>
							<div className="link-item-foot">
								<a href={ `https://thewebs-theme.com/premium/?utm_source=${ link.setting }&utm_campaign=theme-dash` } >
									{ __( 'Learn More', 'thewebs') }
								</a>
							</div>
						</div>
					);
				} ) }
			</div>
		</Fragment>
	);
};

export default withFilters( 'thewebs_theme_pro_modules' )( ProModules );