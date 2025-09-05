/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
const { Fragment } = wp.element;
const { withFilters, TabPanel, Panel, PanelBody, PanelRow, Button } = wp.components;
export const Sidebar = () => {
	return (
		<Fragment>
			<Panel className="community-section sidebar-section">
				<PanelBody
					opened={ true }
				>
					<h2>{ __( 'Web Creators Community', 'thewebs' ) }</h2>
					<p>{ __( 'Join our community of fellow thewebs users creating effective websites! Share your site, ask a question and help others.', 'thewebs' ) }</p>
					<a href="#"  class="sidebar-link">{ __( 'Join our Facebook Group', 'thewebs' ) }</a>
				</PanelBody>
			</Panel>
			<Panel className="support-section sidebar-section">
				<PanelBody
					opened={ true }
				>
					<h2>{ __( 'Support', 'thewebs' ) }</h2>
					<p>{ __( 'Have a question, we are happy to help! Get in touch with our support team.', 'thewebs' ) }</p>
					<a href="#"  class="sidebar-link">{ __( 'Submit a Ticket', 'thewebs' ) }</a>
				</PanelBody>
			</Panel>
		</Fragment>
	);
};

export default withFilters( 'thewebs_theme_sidebar' )( Sidebar );