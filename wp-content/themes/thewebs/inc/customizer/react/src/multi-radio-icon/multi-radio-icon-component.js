/* jshint esversion: 6 */
import PropTypes from 'prop-types';
import classnames from 'classnames';

import ResponsiveControl from '../common/responsive.js';
import Icons from '../common/icons.js';

import { __ } from '@wordpress/i18n';

const { ButtonGroup, Dashicon, Tooltip, Button } = wp.components;

const { Component, Fragment } = wp.element;
class RadioIconComponent extends Component {
	constructor() {
		super( ...arguments );
		this.updateValues = this.updateValues.bind( this );
		let value = this.props.control.setting.get();
		let baseDefault = {
			'include': {
				'mobile': '',
				'tablet': '',
				'desktop': 'logo_title_tagline'
			},
			'layout': {
				'mobile': '',
				'tablet': '',
				'desktop': 'standard'
			}
		};
		this.defaultValue = this.props.control.params.default ? {
			...baseDefault,
			...this.props.control.params.default
		} : baseDefault;
		value = value ? {
			...this.defaultValue,
			...value
		} : this.defaultValue;
		let defaultParams = {
			include: {
				logo_only: {
					tooltip: __( 'Logo Only', 'thewebs' ),
					name: __( 'Logo', 'thewebs' ),
				},
				logo_title: {
					tooltip: __( 'Logo & Title', 'thewebs' ),
					name: __( 'Logo & Title', 'thewebs' ),
				},
				logo_title_tagline: {
					tooltip: __( 'Logo, Title & Tagline', 'thewebs' ),
					name: __( 'Logo, Title & Tagline', 'thewebs' ),
				},
			},
			layout: {
				logo_only: {
					standard: {
						tooltip: __( 'Logo Only', 'thewebs' ),
						icon: Icons.logo
					},
				},
				logo_title: {
					standard: {
						tooltip: __( 'Logo - Title', 'thewebs' ),
						icon: Icons.logoTitle
					},
					title_logo: {
						tooltip: __( 'Title - Logo', 'thewebs' ),
						icon: Icons.titleLogo
					},
					top_logo_title: {
						tooltip: __( 'Top Logo - Title', 'thewebs' ),
						icon: Icons.topLogoTitle
					},
					top_title_logo: {
						tooltip: __( 'Top Title - Logo', 'thewebs' ),
						icon: Icons.topTitleLogo
					},
				},
				logo_title_tagline: {
					standard: {
						tooltip: __( 'Logo - Title - Tagline', 'thewebs' ),
						icon: Icons.logoTitleTag
					},
					title_tag_logo: {
						tooltip: __( 'Title - Tagline - Logo', 'thewebs' ),
						icon: Icons.titleTagLogo
					},
					top_logo_title_tag: {
						tooltip: __( 'Top Logo - Title - Tagline', 'thewebs' ),
						icon: Icons.topLogoTitleTag
					},
					top_title_tag_logo: {
						tooltip: __( 'Top Title - Tagline - Logo', 'thewebs' ),
						icon: Icons.topTitleTagLogo
					},
					top_title_logo_tag: {
						tooltip: __( 'Top Title - Logo - Tagline', 'thewebs' ),
						icon: Icons.topTitleLogoTag
					}
				},
			}
		};
		this.controlParams = this.props.control.params.input_attrs ? {
			...defaultParams,
			...this.props.control.params.input_attrs,
		} : defaultParams;
		this.state = {
			currentDevice: 'desktop',
			include: value.include,
			layout: value.layout,
		};
	}
	render() {
		const controlLabel = (
			<Fragment>
				{ this.state.currentDevice !== 'desktop' && (
					<Tooltip text={ __( 'Reset Device Values', 'thewebs' ) }>
						<Button
							className="reset thewebs-reset"
							disabled={ ( this.state.include[this.state.currentDevice] === this.defaultValue.include[this.state.currentDevice] ) && ( this.state.layout[this.state.currentDevice] === this.defaultValue.layout[this.state.currentDevice] ) }
							onClick={ () => {
								let value = this.state.include;
								value[this.state.currentDevice] = this.defaultValue.include[this.state.currentDevice];
								let svalue = this.state.layout;
								svalue[this.state.currentDevice] = this.defaultValue.layout[this.state.currentDevice];
								this.setState( { include: value, layout: svalue } );
								this.updateValues( { include: value, layout: svalue } );
							} }
						>
							<Dashicon icon='image-rotate' />
						</Button>
					</Tooltip>
				) }
				{ this.props.control.params.label &&
					this.props.control.params.label
				}
			</Fragment>
		);
		return (
			<div className="thewebs-control-field thewebs-radio-icon-control">
				<ResponsiveControl
					onChange={ ( currentDevice) => this.setState( { currentDevice } ) }
					controlLabel={ controlLabel }
				>
					<ButtonGroup className="thewebs-radio-container-control">
						{ Object.keys( this.controlParams.include ).map( ( item ) => {
							return (
								<Tooltip text={ this.controlParams.include[ item ].tooltip }>
									<Button
											isTertiary
											className={ ( item === this.state.include[this.state.currentDevice] ?
													'active-radio ' :
													'' ) + item }
											onClick={ () => {
												let value = this.state.include;
												value[ this.state.currentDevice ] = item;
												let svalue = this.state.layout;
												svalue[ this.state.currentDevice ] = 'standard';
												this.setState( { include: value, layout: svalue } );
												this.updateValues( { include: value, layout: svalue } );
											} }
									>
										{ this.controlParams.include[ item ].name }
									</Button>
								</Tooltip>
							);
						} )}
					</ButtonGroup>
					{ undefined !== this.state.include[this.state.currentDevice] && '' !== this.state.include[this.state.currentDevice] && 'logo_only' !== this.state.include[this.state.currentDevice] && (
						<ButtonGroup className="thewebs-radio-container-control thewebs-radio-icon-container-control">
							{ Object.keys( this.controlParams.layout[this.state.include[this.state.currentDevice] ] ).map( ( item ) => {
								return (
									<Tooltip text={ this.controlParams.layout[this.state.include[this.state.currentDevice] ][ item ].tooltip }>
										<Button
												isTertiary
												className={ ( item === this.state.layout[this.state.currentDevice] ?
														'active-radio ' :
														'' ) + item }
												onClick={ () => {
													let value = this.state.layout;
													value[ this.state.currentDevice ] = item;
													this.setState( { layout: value } );
													this.updateValues( { layout: value } );
												} }
										>
											{ this.controlParams.layout[this.state.include[this.state.currentDevice] ][ item ].icon }
										</Button>
									</Tooltip>
								);
							} )}
						</ButtonGroup>
					) }
				</ResponsiveControl>
			</div>
		);
	}

	updateValues( value ) {
		this.props.control.setting.set( {
			...this.props.control.setting.get(),
			...value,
			flag: !this.props.control.setting.get().flag
		} );
	}
}

RadioIconComponent.propTypes = {
	control: PropTypes.object.isRequired
};

export default RadioIconComponent;
