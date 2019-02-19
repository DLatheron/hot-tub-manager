import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faArrowLeft,
    faArrowRight,
    faTimesCircle,
    faCheckCircle,
    faExchangeAlt
} from '@fortawesome/free-solid-svg-icons'

// TODO:
// x Support for single of multiple selections???
// x Data from data structure...
//   x Support for optgroup
// d Highlight colour support (trick);
// x Move left;
// x Move all left;
// x Move right;
// x Move all right;
// d Move up;
// d Move down;
// x Autosort;
// x Preserve order;
// x Filter;
// x Clear filtering;
// x Vertical centering of middle toolbar;
// d Bottom toolbar optional;
// x Titles;
// x Titles optional;
// x Search optional;
// x Change handlers;
// - Minimise redrawing...
// x Customise ordering of the toolbar buttons;
// x Customisable titles;
// x Customisable buttons;
// x Remove reliance on Select.
export class Helper {
    static iterateOptions(options, iterationFn) {
        let index = 0;

        options.forEach(option => {
            if (option.values) {
                option.values.forEach(subOption => {
                    iterationFn(subOption, index++);
                });
            } else {
                iterationFn(option, index++);
            }
        });
    }

    static removeSelected(existingSelected, selectedToChange) {
        const updatedSelected = { ...existingSelected };

        _.forEach(selectedToChange, (_, key) => {
            delete updatedSelected[key];
        });

        return updatedSelected;
    }

    static filterOption(option, regExp) {
        if (!regExp) {
            return option;
        }

        if (option.text.match(regExp)) {
            return option;
        }

        return false;
    }

    static filterList(options, selected, searchTermRegExp) {
        const filtered = {
        };

        Helper.iterateOptions(options, option => {
            const key = option.value;

            if (selected[key] && Helper.filterOption(option, searchTermRegExp)) {
                filtered[key] = true;
            }
        });

        return filtered;
    }

    static filterOptions(options, leftSelected, rightSelected, leftSearchTerm, rightSearchTerm) {
        const results = {};

        if (leftSearchTerm) {
            const leftRegExp = new RegExp(leftSearchTerm, 'i');
            results.left = Helper.filterList(
                options,
                leftSelected,
                leftRegExp
            );
        } else {
            results.left = { ...leftSelected };
        }

        if (rightSearchTerm) {
            const rightRegExp = new RegExp(rightSearchTerm, 'i');
            results.right = Helper.filterList(
                options,
                rightSelected,
                rightRegExp
            );
        } else {
            results.right = { ...rightSelected };
        }

        return results;
    }
};

export default class TwoColumnList extends React.PureComponent {
    static propTypes = {
        leftTitle: PropTypes.string,
        rightTitle: PropTypes.string,
        leftSearch: PropTypes.bool,
        rightSearch: PropTypes.bool,
        options: PropTypes.array,
        initiallyRight: PropTypes.object,
        onSelectedChanged: PropTypes.func,
        buttonOrder: PropTypes.arrayOf(PropTypes.string),
        renderButton: PropTypes.func
    };

    static defaultProps = {
        leftTitle: 'All Options:',
        rightTitle: 'Active:',
        leftSearch: true,
        rightSearch: true,
        options: [],
        initiallyRight: {},
        onSelectedChanged: () => {},
        buttonOrder: [
            'MoveAllRight',
            'MoveRight',
            'MoveLeft',
            'MoveAllLeft'
        ],
        renderButton: null
    };

    state = {
        leftSearchTerm: '',
        rightSearchTerm: '',
        leftOptions: {},
        rightOptions: {},
        leftHilighted: {},
        rightHilighted: {},
        leftSelected: {},
        rightSelected: {}
    };

    static getDerivedStateFromProps(props, oldState) {
        const leftSelected = {...oldState.leftSelected};
        const rightSelected = {...oldState.rightSelected};

        Helper.iterateOptions(props.options, option => {
            const key = option.value;

            if (oldState.leftSelected[key] === undefined && oldState.rightSelected[key] === undefined) {
                // We haven't encountered this option before, so assign it based on the props.
                if (props.initiallySelected[key]) {
                    rightSelected[key] = true;
                } else {
                    leftSelected[key] = true;
                }
            }
        });

        const { left: leftFiltered, right: rightFiltered } = Helper.filterOptions(
            props.options,
            leftSelected,
            rightSelected,
            oldState.leftSearchTerm,
            oldState.rightSearchTerm
        );

        const newState = {
            ...oldState,
            leftFiltered,
            rightFiltered,
            leftSelected,
            rightSelected
        };

        return newState;
    }

    toggleHilightedState(existingHilighted, option) {
        const hilighted = {...existingHilighted};
        const key = option.value;

        if (hilighted[key]) {
            delete hilighted[key];
        } else {
            hilighted[key] = true;
        }

        return hilighted;
    }

    onMoveRight = () => {
        const leftSelected = Helper.removeSelected(this.state.leftSelected, this.state.leftHilighted);
        const rightSelected = {
            ...this.state.rightSelected,
            ...this.state.leftHilighted
        };

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: {},
            rightHilighted: this.state.leftHilighted
        });
    }

    onMoveLeft = () => {
        const leftSelected = {
            ...this.state.leftSelected,
            ...this.state.rightHilighted
        };
        const rightSelected = Helper.removeSelected(this.state.rightSelected, this.state.rightHilighted);

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: this.state.rightHilighted,
            rightHilighted: {}
        });
    }

    onMoveAllRight = () => {
        const leftSelected = Helper.removeSelected(this.state.leftSelected, this.state.leftFiltered);
        const rightSelected = {
            ...this.state.rightSelected,
            ...this.state.leftFiltered
        };

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: {},
            rightHilighted: this.state.leftFiltered
        });
    }

    onMoveAllLeft = (event) => {
        const leftSelected = {
            ...this.state.leftSelected,
            ...this.state.rightSelected
        };
        const rightSelected = {};

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: this.state.rightHilighted,
            rightHilighted: {}
        });
    }

    onLeftOptionHilightedToggle = (option) => {
        this.setState({
            leftHilighted: this.toggleHilightedState(this.state.leftHilighted, option)
        });
    }

    onRightOptionHilightedToggle = (option) => {
        this.setState({
            rightHilighted: this.toggleHilightedState(this.state.rightHilighted, option)
        });
    }

    onHilightAllLeft = () => {
        this.setState({ leftHilighted: { ...this.state.leftFiltered } });
    }

    onHilightAllRight = () => {
        this.setState({ rightHilighted: { ...this.state.rightFiltered } });
    }

    onHilightInvertLeft = () => {
        const leftHilighted = {};

        Helper.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (this.state.leftFiltered[key] && !this.state.leftHilighted[key]) {
                leftHilighted[key] = true;
            }
        });

        this.setState({ leftHilighted });
    }

    onHilightInvertRight = () => {
        const rightHilighted = {};

        Helper.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (this.state.rightFiltered[key] && !this.state.rightHilighted[key]) {
               rightHilighted[key] = true;
            }
        });

        this.setState({ rightHilighted });
    }

    onHilightNoneLeft = () => {
        this.setState({ leftHilighted: {} });
    }

    onHilightNoneRight = () => {
        this.setState({ rightHilighted: {} });
    }

    onSearchTermChangeLeft = (event) => {
        this.setState({ leftSearchTerm: event.target.value });
    }

    onSearchTermChangeRight = (event) => {
        this.setState({ rightSearchTerm: event.target.value });
    }

    onSearchTermClearedLeft = () => {
        this.setState({ leftSearchTerm: '' });
    }

    onSearchTermClearedRight = () => {
        this.setState({ rightSearchTerm: '' });
    }

    renderOption = (option, selected, hilighted, filtered, handleOptionHilightedToggle) => {
        if (option.values) {
            const subOptions = option.values.reduce((results, option) => {
                const renderResult = this.renderOption(option, selected, hilighted, filtered, handleOptionHilightedToggle);

                if (renderResult) {
                    results.push(renderResult);
                }

                return results;
            }, []);

            if (subOptions.length > 0) {
                return (
                    <div className='group' key={option.values[0].value}>
                        {option.text}
                        {subOptions}
                    </div>
                );
            }
        } else {
            const key = option.value;

            if (filtered[key]) {
                return (
                    <div
                        className={classNames('option', hilighted[key] && 'hilighted')}
                        key={key}
                        value={key}
                        onClick={() => handleOptionHilightedToggle(option)}
                    >
                        {option.text}
                    </div>
                );
            }
        }
    }

    renderButton(type, disabled, handler) {
        if (this.props.renderButton) {
            return this.props.renderButton(type, disabled, handler);
        } else {
            let icon;

            switch (type) {
                case 'MoveAllRight': icon = faAngleDoubleRight; break;
                case 'MoveAllLeft': icon = faAngleDoubleLeft; break;
                case 'MoveRight': icon = faArrowRight; break;
                case 'MoveLeft': icon = faArrowLeft; break;
                case 'SelectAll': icon = faCheckCircle; break;
                case 'Invert': icon = faExchangeAlt; break;
                case 'SelectNone': icon = faTimesCircle; break;
                default: break;
            }

            return (
                <button
                    key={type}
                    type='button'
                    disabled={disabled}
                    onClick={handler}
                >
                    <FontAwesomeIcon className='icon' icon={icon} />
                </button>
            );
        }
    }

    renderVerticalToolbar = (buttonType, leftFiltered, rightFiltered, leftHilighted, rightHilighted) => {
        switch (buttonType) {
            case 'MoveAllRight':
                return this.renderButton('MoveAllRight', _.isEmpty(leftFiltered), this.onMoveAllRight);

            case 'MoveAllLeft':
                return this.renderButton('MoveAllLeft', _.isEmpty(rightFiltered), this.onMoveAllLeft);

            case 'MoveRight':
                return this.renderButton('MoveRight', _.isEmpty(leftHilighted), this.onMoveRight);

            case 'MoveLeft':
                return this.renderButton('MoveLeft', _.isEmpty(rightHilighted), this.onMoveLeft);

            default:
                throw new Error(`Unknown button type ${buttonType}`);
        }
    }

    renderListToolbar = (filtered, hilighted, handleHilightAll, handleHilightInvert, handleHilightNone) => {
        const numHighlighted = Object.keys(hilighted).length;
        const numFiltered = Object.keys(filtered).length;
        const allHilighted = numHighlighted < numFiltered;
        const anyHighlighted = numHighlighted > 0;

        return (
            <>
                { this.renderButton('SelectAll', !allHilighted, handleHilightAll) }
                { this.renderButton('Invert', (numFiltered === 0), handleHilightInvert) }
                { this.renderButton('SelectNone', !anyHighlighted, handleHilightNone) }
            </>
        );
    }

    render() {
        const leftOptions = this.props.options.map(option =>
            this.renderOption(
                option,
                this.state.leftSelected,
                this.state.leftHilighted,
                this.state.leftFiltered,
                this.onLeftOptionHilightedToggle
            )
        );
        const rightOptions = this.props.options.map(option =>
            this.renderOption(
                option,
                this.state.rightSelected,
                this.state.rightHilighted,
                this.state.rightFiltered,
                this.onRightOptionHilightedToggle
            )
        );

        return (
            <div className='two-column-list'>
                {
                    this.props.leftTitle &&
                        <div className='title left'>
                            { this.props.leftTitle }
                        </div>
                }
                {
                    this.props.rightTitle &&
                        <div className='title right'>
                            { this.props.rightTitle }
                        </div>
                }
                {
                    this.props.leftSearch &&
                        <div className='search-bar left'>
                            <input
                                type='text'
                                placeholder='Type filter term...'
                                value={this.state.leftSearchTerm}
                                onChange={this.onSearchTermChangeLeft}
                            />
                            <FontAwesomeIcon
                                className={classNames('clear', !this.state.leftSearchTerm && 'hidden')}
                                icon={faTimesCircle}
                                onClick={this.onSearchTermClearedLeft}
                            />
                        </div>
                }
                {
                    this.props.rightSearch &&
                        <div className='search-bar right'>
                            <input
                                type='text'
                                placeholder='Type filter term...'
                                value={this.state.rightSearchTerm}
                                onChange={this.onSearchTermChangeRight}
                            />
                            <FontAwesomeIcon
                                className={classNames('clear', !this.state.rightSearchTerm && 'hidden')}
                                icon={faTimesCircle}
                                onClick={this.onSearchTermClearedRight}
                            />
                        </div>
                }
                <div className='list left'>
                    { leftOptions }
                </div>
                <div className='list right'>
                    { rightOptions }
                </div>
                <div className='toolbar left'>
                    {
                        this.renderListToolbar(
                            this.state.leftFiltered,
                            this.state.leftHilighted,
                            this.onHilightAllLeft,
                            this.onHilightInvertLeft,
                            this.onHilightNoneLeft
                        )
                    }
                </div>
                <div className='toolbar right'>
                    {
                        this.renderListToolbar(
                            this.state.rightFiltered,
                            this.state.rightHilighted,
                            this.onHilightAllRight,
                            this.onHilightInvertRight,
                            this.onHilightNoneRight
                        )
                    }
                </div>
                <div className='vertical-toolbar middle'>
                    {
                        this.props.buttonOrder.map(buttonType =>
                            this.renderVerticalToolbar(
                                buttonType,
                                this.state.leftFiltered,
                                this.state.rightFiltered,
                                this.state.leftHilighted,
                                this.state.rightHilighted
                            )
                        )
                    }
                </div>
            </div>
        );
    }
}
