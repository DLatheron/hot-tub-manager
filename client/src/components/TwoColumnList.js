import React from 'react';
import PropTypes from 'prop-types';
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
// - Highlight colour support (trick);
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
// - Customise ordering of the toolbar buttons;
// - Customisable titles;
// - Customisable buttons;
// - Remove reliance on Select.
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
        buttonOrder: PropTypes.arrayOf(PropTypes.string)
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
        ]
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

    handleMoveRight = () => {
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

    handleMoveLeft = () => {
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

    handleMoveAllRight = () => {
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

    handleMoveAllLeft = (event) => {
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

    handleLeftOptionHilightedToggle = (option) => {
        this.setState({
            leftHilighted: this.toggleHilightedState(this.state.leftHilighted, option)
        });
    }

    handleRightOptionHilightedToggle = (option) => {
        this.setState({
            rightHilighted: this.toggleHilightedState(this.state.rightHilighted, option)
        });
    }

    handleHilightAllLeft = () => {
        this.setState({ leftHilighted: { ...this.state.leftFiltered } });
    }

    handleHilightAllRight = () => {
        this.setState({ rightHilighted: { ...this.state.rightFiltered } });
    }

    handleHilightInvertLeft = () => {
        const leftHilighted = {};

        Helper.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (this.state.leftFiltered[key] && !this.state.leftHilighted[key]) {
                leftHilighted[key] = true;
            }
        });

        this.setState({ leftHilighted });
    }

    handleHilightInvertRight = () => {
        const rightHilighted = {};

        Helper.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (this.state.rightFiltered[key] && !this.state.rightHilighted[key]) {
               rightHilighted[key] = true;
            }
        });

        this.setState({ rightHilighted });
    }

    handleHilightNoneLeft = () => {
        this.setState({ leftHilighted: {} });
    }

    handleHilightNoneRight = () => {
        this.setState({ rightHilighted: {} });
    }

    handleSearchTermChangeLeft = (event) => {
        this.setState({ leftSearchTerm: event.target.value });
    }

    handleSearchTermChangeRight = (event) => {
        this.setState({ rightSearchTerm: event.target.value });
    }

    handleSearchTermClearedLeft = () => {
        this.setState({ leftSearchTerm: '' });
    }

    handleSearchTermClearedRight = () => {
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
                // Group.
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
                        className={`option ${hilighted[key] ? 'hilighted' : ''}`}
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

    renderButton = (buttonType, leftFiltered, rightFiltered, leftHilighted, rightHilighted) => {
        switch (buttonType) {
            case 'MoveAllRight':
                return (
                    <button
                        key='moveAllRight'
                        type='button'
                        disabled={_.isEmpty(leftFiltered)}
                        onClick={this.handleMoveAllRight}
                    >
                        <FontAwesomeIcon icon={faAngleDoubleRight} />
                    </button>
                );

            case 'MoveAllLeft':
                return (
                    <button
                        key='moveAllLeft'
                        type='button'
                        disabled={_.isEmpty(rightFiltered)}
                        onClick={this.handleMoveAllLeft}
                    >
                        <FontAwesomeIcon icon={faAngleDoubleLeft} />
                    </button>
                );

            case 'MoveRight':
                return (
                    <button
                        key='moveRight'
                        type='button'
                        disabled={_.isEmpty(leftHilighted)}
                        onClick={this.handleMoveRight}
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                );

            case 'MoveLeft':
                return (
                    <button
                        key='moveLeft'
                        type='button'
                        disabled={_.isEmpty(rightHilighted)}
                        onClick={this.handleMoveLeft}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                );

            default:
                    throw new Error(`Unknown button type ${buttonType}`);
        }
    }

    renderToolbar = (filtered, hilighted, handleHilightAll, handleHilightInvert, handleHilightNone) => {
        const numHighlighted = Object.keys(hilighted).length;
        const numFiltered = Object.keys(filtered).length;
        const allHilighted = numHighlighted < numFiltered;
        const anyHighlighted = numHighlighted > 0;

        return (
            <>
                <button
                    type='button'
                    disabled={!allHilighted}
                    onClick={handleHilightAll}
                >
                    <FontAwesomeIcon className='icon' icon={faCheckCircle} />
                </button>
                <button
                    type='button'
                    onClick={handleHilightInvert}
                >
                    <FontAwesomeIcon className='icon' icon={faExchangeAlt} />
                </button>
                <button
                    type='button'
                    disabled={!anyHighlighted}
                    onClick={handleHilightNone}
                >
                    <FontAwesomeIcon className='icon' icon={faTimesCircle} />
                </button>
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
                this.handleLeftOptionHilightedToggle
            )
        );
        const rightOptions = this.props.options.map(option =>
            this.renderOption(
                option,
                this.state.rightSelected,
                this.state.rightHilighted,
                this.state.rightFiltered,
                this.handleRightOptionHilightedToggle
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
                                onChange={this.handleSearchTermChangeLeft}
                            />
                            <FontAwesomeIcon
                                className={`clear + ${!this.state.leftSearchTerm ? 'hidden' : ''}`}
                                icon={faTimesCircle}
                                onClick={this.handleSearchTermClearedLeft}
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
                                onChange={this.handleSearchTermChangeRight}
                            />
                            <FontAwesomeIcon
                                className={`clear + ${!this.state.rightSearchTerm ? 'hidden' : ''}`}
                                icon={faTimesCircle}
                                onClick={this.handleSearchTermClearedRight}
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
                        this.renderToolbar(
                            this.state.leftFiltered,
                            this.state.leftHilighted,
                            this.handleHilightAllLeft,
                            this.handleHilightInvertLeft,
                            this.handleHilightNoneLeft
                        )
                    }
                </div>
                <div className='toolbar right'>
                    {
                        this.renderToolbar(
                            this.state.rightFiltered,
                            this.state.rightHilighted,
                            this.handleHilightAllRight,
                            this.handleHilightInvertRight,
                            this.handleHilightNoneRight
                        )
                    }
                </div>
                <div className='vertical-toolbar middle'>
                    {
                        this.props.buttonOrder.map(buttonType =>
                            this.renderButton(
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
