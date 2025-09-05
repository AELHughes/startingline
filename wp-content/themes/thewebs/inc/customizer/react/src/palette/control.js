import PaletteComponent from './palette-component.js';

export const PaletteControl = wp.customize.ThewebsControl.extend( {
	renderContent: function renderContent() {
		let control = this;
		ReactDOM.render(
				<PaletteComponent control={control}/>,
				control.container[0]
		);
	}
} );
