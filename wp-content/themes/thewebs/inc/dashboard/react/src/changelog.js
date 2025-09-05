/**
 * WordPress dependencies
 */
 import { __ } from '@wordpress/i18n';
const { Fragment } = wp.element;
const { withFilters } = wp.components;
const { TabPanel, Panel, PanelBody } = wp.components;
import ChangelogItem from './changelog-item';

export const ChangelogTab = () => {
	const tabs = [
		{
			name: 'thewebs',
			title: __( 'Changelog', 'thewebs' ),
			className: 'thewebs-changelog-tab',
		},
		{
			name: 'pro',
			title: __( 'Pro Changelog', 'thewebs' ),
			className: 'thewebs-pro-changelog-tab',
		},
	];
	return (
		<Fragment>
			{ thewebsDashboardParams.changelog && (
				<Fragment>
					{ thewebsDashboardParams.proChangelog && thewebsDashboardParams.proChangelog.length && (
						<TabPanel className="thewebs-dashboard-changelog-tab-panel"
							activeClass="active-tab"
							tabs={ tabs }>
							{
								( tab ) => {
									switch ( tab.name ) {
										case 'thewebs':
											return (
												<Panel className="thewebs-changelog-section tab-section">
													<PanelBody
														opened={ true }
													>
														{ thewebsDashboardParams.changelog.map( ( item, index ) => {
															return <ChangelogItem
																item={ item }
																index={ item }
															/>;
														} ) }
													</PanelBody>
												</Panel>
											);

										case 'pro':
											return (
												<Panel className="pro-changelog-section tab-section">
													<PanelBody
														opened={ true }
													>
														{ thewebsDashboardParams.proChangelog.map( ( item, index ) => {
															return <ChangelogItem
																item={ item }
																index={ item }
															/>;
														} ) }
													</PanelBody>
												</Panel>
											);
									}
								}
							}
						</TabPanel>
					) }
					{ ( '' == thewebsDashboardParams.proChangelog || ( Array.isArray( thewebsDashboardParams.proChangelog ) && ! thewebsDashboardParams.proChangelog.length ) ) && (
						<Fragment>
							{ thewebsDashboardParams.changelog.map( ( item, index ) => {
								return <ChangelogItem
									item={ item }
									index={ item }
								/>;
							} ) }
						</Fragment>
					) }
				</Fragment>
			) }
		</Fragment>
	);
};

export default withFilters( 'thewebs_theme_changelog' )( ChangelogTab );