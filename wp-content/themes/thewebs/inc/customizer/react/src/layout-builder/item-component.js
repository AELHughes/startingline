/* jshint esversion: 6 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ResponsiveControl from '../common/responsive.js';
import Icons from '../common/icons.js';

import { __ } from '@wordpress/i18n';

const { ButtonGroup, Dashicon, Tooltip, Button } = wp.components;

const { Component, Fragment } = wp.element;
class ItemComponent extends Component {
	constructor() {
		super( ...arguments );
		this.choices = ( thewebsCustomizerControlsData && thewebsCustomizerControlsData.choices && thewebsCustomizerControlsData.choices[ this.props.controlParams.group ] ? thewebsCustomizerControlsData.choices[ this.props.controlParams.group ] : [] );
	}
	render() {
		return (
			<div className="thewebs-builder-item" data-id={ this.props.item } data-section={ undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].section ? this.choices[ this.props.item ].section : '' } key={ this.props.item }>
				<span
					className="thewebs-builder-item-icon thewebs-move-icon"
				>
					{ Icons['drag'] }
				</span>
				<span
					className="thewebs-builder-item-text"
				>
					{ ( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].name ? this.choices[ this.props.item ].name : '' ) }
				</span>
				<Button
					className="thewebs-builder-item-focus-icon thewebs-builder-item-icon"
					aria-label={ __( 'Setting settings for', 'thewebs' ) + ' ' + ( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].name ? this.choices[ this.props.item ].name : '' ) }
					onClick={ () => {
						this.props.focusItem( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].section ? this.choices[ this.props.item ].section : '' );
					} }
				>
					<Dashicon icon="admin-generic"/>
				</Button>
				{ thewebsCustomizerControlsData.blockWidgets && this.props.item.includes('widget') && 'toggle-widget' !== this.props.item && (
					<Button
						className="thewebs-builder-item-focus-icon thewebs-builder-item-icon"
						aria-label={ __( 'Setting settings for', 'thewebs' ) + ' ' + ( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].name ? this.choices[ this.props.item ].name : '' ) }
						onClick={ () => {
							this.props.focusItem( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].section ? 'thewebs_customizer_' + this.choices[ this.props.item ].section : '' );
						} }
					>
						<Dashicon icon="admin-settings"/>
					</Button>
				) }
				{ thewebsCustomizerControlsData.blockWidgets && 'toggle-widget' === this.props.item && (
					<Button
						className="thewebs-builder-item-focus-icon thewebs-builder-item-icon"
						aria-label={ __( 'Setting settings for', 'thewebs' ) + ' ' + ( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].name ? this.choices[ this.props.item ].name : '' ) }
						onClick={ () => {
							this.props.focusItem( 'thewebs_customizer_sidebar-widgets-header2' );
						} }
					>
						<Dashicon icon="admin-settings"/>
					</Button>
				) }
				<Button
					className="thewebs-builder-item-icon"
					aria-label={ __( 'Remove', 'thewebs' ) + ' ' + ( undefined !== this.choices[ this.props.item ] && undefined !== this.choices[ this.props.item ].name ? this.choices[ this.props.item ].name : '' ) }
					onClick={ () => {
						this.props.removeItem( this.props.item );
					} }
				>
					<Dashicon icon="no-alt"/>
				</Button>
			</div>
		);
	}
}
export default ItemComponent;
