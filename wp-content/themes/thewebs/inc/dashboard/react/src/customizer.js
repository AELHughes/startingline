/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
const { Fragment } = wp.element;
import map from 'lodash/map';
const { withFilters, TabPanel, Panel, PanelBody, PanelRow, Button } = wp.components;

export const CustomizerLinks = () => {
	const headerLinks = [
		{
			title: __( 'Global Colors', 'thewebs' ),
			description: __( 'Setup the base color scheme for your site.', 'thewebs' ),
			focus: 'thewebs_customizer_general_colors',
			type: 'section',
			setting: false
		},
		{
			title: __( 'Branding', 'thewebs' ),
			description: __( 'Upload your logo and favicon.', 'thewebs' ),
			focus: 'title_tagline',
			type: 'section',
			setting: false
		},
		{
			title: __( 'Typography', 'thewebs' ),
			description: __( 'Choose the perfect font family, style and sizes.', 'thewebs' ),
			focus: 'thewebs_customizer_general_typography',
			type: 'section',
			setting: false
		},
		{
			title: __( 'Header Layout', 'thewebs' ),
			description: __( 'Add elements and arrange them how you want.', 'thewebs' ),
			focus: 'thewebs_customizer_header',
			type: 'panel',
			setting: false
		},
		{
			title: __( 'Page Layout', 'thewebs' ),
			description: __( 'Define your sites general page look and feel for page title, and content style.', 'thewebs' ),
			focus: 'thewebs_customizer_page_layout',
			type: 'section',
			setting: false
		},
		{
			title: __( 'Footer Layout', 'thewebs' ),
			description: __( 'Customize the columns and place widget areas in unlimited configurations', 'thewebs' ),
			focus: 'thewebs_customizer_footer_layout',
			type: 'section',
			setting: false
		},
	];
	return (
		<Fragment>
			<h2 className="section-header">{ __( 'Customize Your Site', 'thewebs' ) }</h2>
			<div className="two-col-grid">
				{ map( headerLinks, ( link ) => {
					return (
						<div className="link-item">
							<h4>{ link.title }</h4>
							<p>{ link.description }</p>
							<div className="link-item-foot">
								<a href={ `${thewebsDashboardParams.adminURL}customize.php?autofocus%5B${ link.type }%5D=${ link.focus }` }>
									{ __( 'Customize', 'thewebs') }
								</a>
							</div>
						</div>
					);
				} ) }
			</div>
		</Fragment>
	);
};

export default withFilters( 'thewebs_theme_customizer' )( CustomizerLinks );