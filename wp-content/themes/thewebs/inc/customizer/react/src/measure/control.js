import MeasureComponent from './measure-component';

export const MeasureControl = wp.customize.ThewebsControl.extend( {
	renderContent: function renderContent() {
		let control = this;
		ReactDOM.render(
				<MeasureComponent control={control}/>,
				control.container[0]
		);
	}
} );
