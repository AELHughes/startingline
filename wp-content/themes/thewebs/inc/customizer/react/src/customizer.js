( function( $, api ) {
	var $window = $( window ),
		$document = $( document ),
		$body = $( 'body' );
	/**
	 * API on ready event handlers
	 *
	 * All handlers need to be inside the 'ready' state.
	 */
	wp.customize.bind( 'ready', function() {
		$( 'input[name=thewebs-flush-local-fonts-button]' ).on( 'click', function( e ) {
			var data = {
				wp_customize: 'on',
				action: 'thewebs_flush_fonts_folder',
				nonce: thewebsCustomizerControlsData.flushFonts
			};	
			$( 'input[name=thewebs-flush-local-fonts-button]' ).attr('disabled', 'disabled');
	
			$.post( ajaxurl, data, function ( response ) {
				if ( response && response.success ) {
					$( 'input[name=thewebs-flush-local-fonts-button]' ).val( 'Successfully Flushed' );
				} else {
					$( 'input[name=thewebs-flush-local-fonts-button]' ).val( 'Failed, Reload Page and Try Again' );
				}
			});
		});

		wp.customize.state.create( 'thewebsTab' );
		wp.customize.state( 'thewebsTab' ).set( 'general' );
		

		// Set handler when custom responsive toggle is clicked.
		$( '#customize-theme-controls' ).on( 'click', '.thewebs-build-tabs-button:not(.thewebs-nav-tabs-button)', function( e ) {
			e.preventDefault();

			wp.customize.previewedDevice.set( $( this ).attr( 'data-device' ) );
		});
		// Set handler when custom responsive toggle is clicked.
		$( '#customize-theme-controls' ).on( 'click', '.thewebs-compontent-tabs-button:not(.thewebs-nav-tabs-button)', function( e ) {
			e.preventDefault();

			wp.customize.state( 'thewebsTab' ).set( $( this ).attr( 'data-tab' ) );
		});
		var setCustomTabElementsDisplay = function() {
			var tabState = wp.customize.state( 'thewebsTab' ).get(),
			$tabs = $( '.thewebs-compontent-tabs-button:not(.thewebs-nav-tabs-button)' );
			$tabs.removeClass( 'nav-tab-active' ).filter( '.thewebs-' + tabState + '-tab' ).addClass( 'nav-tab-active' );
		}
		// Refresh all responsive elements when previewedDevice is changed.
		wp.customize.state( 'thewebsTab' ).bind( setCustomTabElementsDisplay );

		$( '#customize-theme-controls' ).on( 'click', 'customize-section-back', function( e ) {
			wp.customize.state( 'thewebsTab' ).set( 'general' );
		});
		if ( thewebsCustomizerControlsData && thewebsCustomizerControlsData.contexts ) {
			/**
			 * Active callback script (JS version)
			 * ref: https://make.xwp.co/2016/07/24/dependently-contextual-customizer-controls/
			 */
			_.each( thewebsCustomizerControlsData.contexts, function( rules, key ) {
				var getSetting = function( settingName ) {
					// Get the dependent setting.
					switch ( settingName ) {
						case '__device':
							return wp.customize.previewedDevice;
							break;
						case '__current_tab':
							return wp.customize.state( 'thewebsTab' );
							break;
						default:
							// Check if we have an extra source in the mix
							if ( thewebsCustomizerControlsData.source ) {
								// Check if this setting might be powered by the extra source.
								if ( wp.customize( thewebsCustomizerControlsData.source + '[' + settingName + ']' ) ) {
									return wp.customize( thewebsCustomizerControlsData.source + '[' + settingName + ']' );
								} else {
									return wp.customize( settingName );
								}
							}
							return wp.customize( settingName );
							break;
					}
				}
				var initContext = function( element ) {
					// Main function returning the conditional value
					var isDisplayed = function() {
						var displayed = false,
						    relation = rules['relation'];

						// Fallback invalid relation type to "AND".
						// Assign default displayed to true for "AND" relation type.
						if ( 'OR' !== relation ) {
							relation = 'AND';
							displayed = true;
						}

						// Each rule iteration
						_.each( rules, function( rule, i ) {
							// Skip "relation" property.
							if ( 'relation' == i ) return;

							// If in "AND" relation and "displayed" already flagged as false, skip the rest rules.
							if ( 'AND' == relation && false == displayed ) return;

							// Skip if no setting propery found.
							if ( undefined === rule['setting'] ) return;

							var result = false,
							    setting = getSetting( rule['setting'] );
							// Only process the rule if dependent setting is found.
							// Otherwise leave the result to "false".
							if ( undefined !== setting ) {
								var operator = rule['operator'],
								    comparedValue = rule['value'],
									currentValue = setting.get();
								if ( undefined == operator || '=' == operator ) {
									operator = '==';
								}

								if ( 'sub_object_contains' === operator ) {
									if ( undefined !== currentValue[ rule['sub_key'] ] ) {
										currentValue = currentValue[ rule['sub_key'] ];
									}
								}
								if ( 'sub_object_does_not_contain' === operator ) {
									if ( undefined !== currentValue[ rule['sub_key'] ] ) {
										currentValue = currentValue[ rule['sub_key'] ];
									}
								}
								switch ( operator ) {
									case '>':
										result = currentValue > comparedValue; 
										break;

									case '<':
										result = currentValue < comparedValue; 
										break;

									case '>=':
										result = currentValue >= comparedValue; 
										break;

									case '<=':
										result = currentValue <= comparedValue; 
										break;

									case 'in':
										result = 0 <= comparedValue.indexOf( currentValue );
										break;

									case 'not_in':
										result = 0 > comparedValue.indexOf( currentValue );
										break;

									case 'contain':
										//result = ( currentValue.includes( comparedValue ) );
										result = 0 <= currentValue.indexOf( comparedValue );
										break;

									case 'not_contain':
										result = 0 > currentValue.indexOf( comparedValue );
										break;

									case 'in':
										result = 0 <= comparedValue.indexOf( currentValue );
										break;
	
									case 'array_includes':
										result = currentValue.includes( comparedValue );
										break;
									case 'sub_object_does_not_contain':
										if ( rule['responsive'] ) {
											result = true;
											{ Object.keys( { 'desktop':'', 'tablet':'', 'mobile':'' } ).map( ( device ) => {
												if ( currentValue[ device ].includes( comparedValue ) ) {
													result = false;
												}
											} ) }
										} else {
											result = ! currentValue.includes( comparedValue );
										}
										break;
									case 'sub_object_contains':
										if ( rule['responsive'] ) {
											{ Object.keys( { 'desktop':'', 'tablet':'', 'mobile':'' } ).map( ( device ) => {
												if ( currentValue[ device ].includes( comparedValue ) ) {
													result = true;
												}
											} ) }
										} else {
											result = currentValue.includes( comparedValue );
										}
										break;

									case 'empty':
										result = (currentValue === undefined || currentValue == null || currentValue.length <= 0);
										//result = 0 == currentValue.length;
										break;

									case '!empty':
										result = typeof currentValue !== 'undefined' && undefined !== currentValue && null !== currentValue && '' !== currentValue;
										//result = 0 < currentValue.length;
										break;
									case '!=':
										result = comparedValue !== currentValue;
										//result = 0 < currentValue.length;
										break;
									case 'load_italic':
										result = false;
										if ( currentValue['family'] && currentValue['google'] && currentValue['variant'] ) {
											if ( 0 > currentValue['variant'].indexOf( 'italic' ) ) {
												if ( thewebsCustomizerControlsData.gfontvars && thewebsCustomizerControlsData.gfontvars[ currentValue['family'] ] && thewebsCustomizerControlsData.gfontvars[ currentValue['family'] ].v && thewebsCustomizerControlsData.gfontvars[ currentValue['family'] ].v.includes( 'italic' ) ) {
													result = true;
												}
											}
										}
										break;
									default:
										result = comparedValue == currentValue;
										break;
								}
							}

							// Combine to the final result.
							switch ( relation ) {
								case 'OR':
									displayed = displayed || result;
									break;

								default:
									displayed = displayed && result;
									break;
							}
						});

						return displayed;
					};

					// Wrapper function for binding purpose
					var setActiveState = function() {
						element.active.set( isDisplayed() );
					};

					// Setting changes bind
					_.each( rules, function( rule, i ) {
						// Skip "relation" property.
						if ( 'relation' == i ) return;
						var setting = getSetting( rule['setting'] );

						if ( undefined !== setting ) {
							// Bind the setting for future use.
							setting.bind( setActiveState );
						}
					});

					// Initial run
					element.active.validate = isDisplayed;
					setActiveState();
				};

				if ( 0 == key.indexOf( 'thewebs_customizer' ) ) {
					wp.customize.section( key, initContext );
				} else {
					wp.customize.control( key, initContext );
				}
			});
		}

		// Set all custom responsive toggles and fieldsets.
		var setCustomResponsiveElementsDisplay = function() {
			var device = wp.customize.previewedDevice.get(),
			    $tabs = $( '.thewebs-build-tabs-button.nav-tab' );
			$tabs.removeClass( 'nav-tab-active' ).filter( '.preview-' + device ).addClass( 'nav-tab-active' );
		}
		// Refresh all responsive elements when previewedDevice is changed.
		wp.customize.previewedDevice.bind( setCustomResponsiveElementsDisplay );

		// Refresh all responsive elements when any section is expanded.
		// This is required to set responsive elements on newly added controls inside the section.
		wp.customize.section.each(function ( section ) {
			section.expanded.bind( setCustomResponsiveElementsDisplay );
		});

		/**
		 * Resize Preview Frame when show / hide Builder.
		 */
		var resizePreviewer = function() {
			var $section = $( '.control-section.thewebs-builder-active' );
			var $footer = $( '.control-section.thewebs-footer-builder-active' );
			if ( $body.hasClass( 'thewebs-builder-is-active' ) || $body.hasClass( 'thewebs-footer-builder-is-active' ) ) {
				if ( $body.hasClass( 'thewebs-footer-builder-is-active' ) && 0 < $footer.length && ! $footer.hasClass( 'thewebs-builder-hide' ) ) {
					wp.customize.previewer.container.css( 'bottom', $footer.outerHeight() + 'px' );
				} else if ( $body.hasClass( 'thewebs-builder-is-active' ) && 0 < $section.length && ! $section.hasClass( 'thewebs-builder-hide' ) ) {
					wp.customize.previewer.container.css({ "bottom" : $section.outerHeight() + 'px' });
				} else {
					wp.customize.previewer.container.css( 'bottom', '');
				}
			} else {
				wp.customize.previewer.container.css( 'bottom', '');
			}
		}
		$window.on( 'resize', resizePreviewer );
		wp.customize.previewedDevice.bind(function( device ) {
			setTimeout(function() {
				resizePreviewer();
			}, 250 );
		});
		var reloadPreviewer = function() {
			$( wp.customize.previewer.container ).find( 'iframe' ).css( 'position', 'static' );
			$( wp.customize.previewer.container ).find( 'iframe' ).css( 'position', 'absolute' );
		}
		wp.customize.previewer.bind( 'ready', reloadPreviewer );
		/**
		 * Init Header & Footer Builder
		 */
		var initHeaderBuilderPanel = function( panel ) {
			var section =  wp.customize.section( 'thewebs_customizer_header_builder' );
			if ( section ) {
				var $section = section.contentContainer,
				section_layout =  wp.customize.section( 'thewebs_customizer_header_layout' );
				// If Header panel is expanded, add class to the body tag (for CSS styling).
				panel.expanded.bind(function( isExpanded ) {
					_.each(section.controls(), function( control ) {
						if ( 'resolved' === control.deferred.embedded.state() ) {
							return;
						}
						control.renderContent();
						control.deferred.embedded.resolve(); // This triggers control.ready().
						
						// Fire event after control is initialized.
						control.container.trigger( 'init' );
					});

					if ( isExpanded ) {
						$body.addClass( 'thewebs-builder-is-active' );
						$section.addClass( 'thewebs-builder-active' );
						$section.css('display', 'none').height();
						$section.css('display', 'block');
					} else {
						$body.removeClass( 'thewebs-builder-is-active' );
						$section.removeClass( 'thewebs-builder-active' );
					}
					_.each(section_layout.controls(), function( control ) {
						if ( 'resolved' === control.deferred.embedded.state() ) {
							return;
						}
						control.renderContent();
						control.deferred.embedded.resolve(); // This triggers control.ready().
						
						// Fire event after control is initialized.
						control.container.trigger( 'init' );
					});
					resizePreviewer();
				});
				// Attach callback to builder toggle.
				$section.on( 'click', '.thewebs-builder-tab-toggle', function( e ) {
					e.preventDefault();
					$section.toggleClass( 'thewebs-builder-hide' );
					resizePreviewer();
				});
			}

		};
		wp.customize.panel( 'thewebs_customizer_header', initHeaderBuilderPanel );
		/**
		 * Init Header & Footer Builder
		 */
		var initFooterBuilderPanel = function( panel ) {
			var section =  wp.customize.section( 'thewebs_customizer_footer_builder' );
			if ( section ) {
				var $section = section.contentContainer,
				section_layout =  wp.customize.section( 'thewebs_customizer_footer_layout' );
				// If Header panel is expanded, add class to the body tag (for CSS styling).
				panel.expanded.bind(function( isExpanded ) {
					_.each(section.controls(), function( control ) {
						if ( 'resolved' === control.deferred.embedded.state() ) {
							return;
						}
						control.renderContent();
						control.deferred.embedded.resolve(); // This triggers control.ready().
						
						// Fire event after control is initialized.
						control.container.trigger( 'init' );
					});

					if ( isExpanded ) {
						$body.addClass( 'thewebs-footer-builder-is-active' );
						$section.addClass( 'thewebs-footer-builder-active' );
						$section.css('display', 'none').height();
						$section.css('display', 'block');
					} else {
						$body.removeClass( 'thewebs-footer-builder-is-active' );
						$section.removeClass( 'thewebs-footer-builder-active' );
					}
					_.each(section_layout.controls(), function( control ) {
						if ( 'resolved' === control.deferred.embedded.state() ) {
							return;
						}
						control.renderContent();
						control.deferred.embedded.resolve(); // This triggers control.ready().
						
						// Fire event after control is initialized.
						control.container.trigger( 'init' );
					});
					resizePreviewer();
				});
				// Attach callback to builder toggle.
				$section.on( 'click', '.thewebs-builder-tab-toggle', function( e ) {
					e.preventDefault();
					$section.toggleClass( 'thewebs-builder-hide' );
					resizePreviewer();
				} );
			}

		};
		wp.customize.panel( 'thewebs_customizer_footer', initFooterBuilderPanel );
	});

} )( jQuery, wp );