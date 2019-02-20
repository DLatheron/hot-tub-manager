import React from 'react';
// import PropTypes from 'prop-types';

export default class ControlPane extends React.PureComponent {
    static propTypes = {};

    static defaultProps = {};

    renderComponent = (control) => {
        const type = (control.type || 'control').toLowerCase();

        switch (type) {
            case 'title':
                return (
                    <div className='full-width title'>
                        {control.control}
                    </div>
                );

            case 'separator':
                return (
                    <div className='full-width separator'>
                        {control.control}
                    </div>
                );

            case 'section':
                return (
                    <div className='full-width section'>
                        {control.control.map(this.renderComponent)}
                    </div>
                );

            case 'control':
                return (
                    <>
                        <div className='left label'>
                            {control.label}
                        </div>
                        <div className='right control'>
                            {control.control}
                        </div>
                    </>
                );

            case 'widecontrol':
                return (
                    <div className='full-width'>
                        {control.control}
                    </div>
                );

            default:
                throw new Error(`Unknown control type: ${type}`);
        }
    }

    render() {
        return (
            <div className='control-pane'>
                <div className='section'>
                    { this.props.controls.map(this.renderComponent) }
                </div>
            </div>
        );
    }
}
