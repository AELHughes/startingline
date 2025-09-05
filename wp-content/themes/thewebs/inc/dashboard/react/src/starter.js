/**
 * Activate a plugin
 *
 * @return void
 */
function thewebs_starter_activatePlugin() {
	var data = new FormData();
	data.append( 'action', 'thewebs_install_starter' );
	data.append( 'security', thewebsDashboardParams.ajax_nonce );
	data.append( 'status', thewebsDashboardParams.status );
	jQuery.ajax({
		method:      'POST',
		url:         thewebsDashboardParams.ajax_url,
		data:        data,
		contentType: false,
		processData: false,
	})
	.done( function( response, status, stately ) {
		if ( response.success ) {
			location.replace( thewebsDashboardParams.starterURL );
		}
	})
	.fail( function( error ) {
		console.log( error );
	});
}
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, Fragment } from '@wordpress/element';
const { withFilters, TabPanel, Panel, PanelBody, PanelRow, Button, Spinner } = wp.components;
export const StarterTab = () => {
	const [ working, setWorking ] = useState( null );
	const handleClick = () => {
		setWorking( true );
		thewebs_starter_activatePlugin();
	};
	return (
		<Fragment>
			<div className="thewebs-desk-starter-inner" style={{ margin: '20px auto', textAlign:'center' }}>
				<h2>{ __( 'Starter Templates', 'thewebs' ) }</h2>
				<p>{ __( 'Create and customize professionally designed websites in minutes. Simply choose your template, choose your colors, and import. Done!', 'thewebs' ) }</p>
				<div className="image-container">
					<img width="772" height="250" alt={ __( 'Starter Templates', 'thewebs' ) } src={ thewebsDashboardParams.starterImage } />
				</div>
				{ thewebsDashboardParams.starterTemplates && (
					<a
						className="kt-action-starter thewebs-desk-button"
						href={ thewebsDashboardParams.starterURL }
					>
						{ thewebsDashboardParams.starterLabel }
					</a>
				) }
				{ ! thewebsDashboardParams.starterTemplates && (
					<Button 
						className="kt-action-starter thewebs-desk-button"
						onClick={ () => handleClick() }
					>
						{ thewebsDashboardParams.starterLabel }
						{ working && (
							<Spinner />
						) }
					</Button>

				) }
			</div>
		</Fragment>
	);
};

export default withFilters( 'thewebs_theme_starters' )( StarterTab );