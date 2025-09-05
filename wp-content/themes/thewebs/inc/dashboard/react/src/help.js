/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
const { Fragment } = wp.element;
const { withFilters } = wp.components;

export const HelpTab = () => {
	return (
		<div className="thewebs-desk-help-inner">
			<h2>{ __( 'Welcome to Thewebs!', 'thewebs' ) }</h2>
			<p>{ __( 'You are going to love working with this theme! View the video below to get started with our video tutorials or click the view knowledge base button below to see all the documentation.', 'thewebs' ) }</p>
			<div className="video-container">
				<a href="#"><img width="1280" height="720" src={ thewebsDashboardParams.videoImage } alt={ __( 'Thewebs Theme Getting Started Tutorial - 10 Minute Quick Start Guide', 'thewebs' ) } /></a>
			</div>
			<a href="#" className="thewebs-desk-button" >{ __( 'Video Tutorials', 'thewebs' ) }</a><a href="#" className="thewebs-desk-button thewebs-desk-button-second" >{ __( 'View Knowledge Base', 'thewebs' ) }</a>
		</div>
	);
};

export default withFilters( 'thewebs_theme_help' )( HelpTab );