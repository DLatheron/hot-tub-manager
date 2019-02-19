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
        leftHilighted: {},
        rightHilighted: {},
        leftSelected: {},
        rightSelected: {}
    };

    constructor(props) {
        super(props);

        this.leftSelectRef = React.createRef();
        this.rightSelectRef = React.createRef();
    }

    getSelectedOption(selectElement) {
        console.log(`selectElement: ${selectElement}`);
        const { options } = selectElement;
        console.log(`options: ${options}`);
        const selectedOptions = {};

        // Must use for loop as options are a HTMLOptionsCollection.
        for (let i = 0; i < options.length; ++i) {
            const option = options[i];
            if (option.selected) {
                selectedOptions[option.value] = true;
            }
        }

        return selectedOptions;
    }

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

    static getDerivedStateFromProps(props, oldState) {
        console.log(`getDerivedStateFromProps(${JSON.stringify(props, null, 4)}, ${JSON.stringify(oldState, null, 4)})`);

        const leftSelected = {...oldState.leftSelected};
        const rightSelected = {...oldState.rightSelected};

        TwoColumnList.iterateOptions(props.options, option => {
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

        console.log(`leftSelected: ${JSON.stringify(leftSelected, null, 4)}`);
        console.log(`rightSelected: ${JSON.stringify(rightSelected, null, 4)}`);

        const newState = {
            ...oldState,
            leftSelected,
            rightSelected
        };

        return newState;
    }

    static updateSelected(existingSelected, selectedToChange, changeToMake) {
        const updatedSelected = {...existingSelected};

        _.forEach(selectedToChange, (_, key) => {
            updatedSelected[key] = changeToMake;
        });

        return updatedSelected;
    }

    static removeSelected(existingSelected, selectedToChange) {
        const updatedSelected = {...existingSelected};

        _.forEach(selectedToChange, (_, key) => {
            delete updatedSelected[key];
        });

        return updatedSelected;
    }

    handleMoveRight = () => {
        const leftSelected = TwoColumnList.removeSelected(this.state.leftSelected, this.state.leftHilighted);
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
        const rightSelected = TwoColumnList.removeSelected(this.state.rightSelected, this.state.rightHilighted);

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: this.state.rightHilighted,
            rightHilighted: {}
        });
    }

    static filterObject(obj, filterValue) {
        const newObj = {};

        _.forEach(obj, (value, key) => {
            if (value === filterValue) {
                newObj[key] = value;
            }
        })

        return newObj;
    }

    handleMoveAllRight = () => {
        const leftSelected = {};
        const rightSelected = {
            ...this.state.leftSelected,
            ...this.state.rightSelected
        };

        this.props.onSelectedChanged(leftSelected, rightSelected);

        this.setState({
            leftSelected,
            rightSelected,
            leftHilighted: {},
            rightHilighted: this.state.leftHilighted
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

    static filterOption(option, regExp) {
        if (!regExp) {
            return option;
        }

        if (option.text.match(regExp)) {
            return option;
        }

        return false;
    }

    canMoveAllToRight() {
        return !_.isEmpty(this.state.leftSelected);
    }

    canMoveAllToLeft() {
        return !_.isEmpty(this.state.rightSelected);
    }

    canMoveToRight() {
        return !_.isEmpty(this.state.leftHilighted);
    }

    canMoveToLeft() {
        return !_.isEmpty(this.state.rightHilighted);
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

    renderButton = (buttonType) => {
        switch (buttonType) {
            case 'MoveAllRight':
                return (
                    <button
                        key='moveAllRight'
                        type='button'
                        disabled={!this.canMoveAllToRight()}
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
                        disabled={!this.canMoveAllToLeft()}
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
                        disabled={!this.canMoveToRight()}
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
                        disabled={!this.canMoveToLeft()}
                        onClick={this.handleMoveLeft}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                );

            default:
                    throw new Error(`Unknown button type ${buttonType}`);
        }
    }

    handleHilightAllLeft = (toSelect) => {
        this.setState({ leftHilighted: { ...toSelect } });
    }

    handleHilightAllRight = (toSelect) => {
        this.setState({ rightHilighted: { ...toSelect } });
    }

    handleHilightInvertLeft = (toSelect) => {
        const leftHilighted = {};

        TwoColumnList.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (toSelect[key] && !this.state.leftHilighted[key]) {
                leftHilighted[key] = true;
            }
        });

        this.setState({ leftHilighted });
    }

    handleHilightInvertRight = (toSelect) => {
        // TODO: Redo.
        const rightHilighted = {};

        TwoColumnList.iterateOptions(this.props.options, option => {
            const key = option.value;
            if (toSelect[key] && !this.state.rightHilighted[key]) {
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

    // buildOptions(side, options, selected, hilighted, searchTermRegExp, handleOptionHilightedToggle) {
    //     const result = {
    //         render: []
    //     };

    //     options.forEach(option => {
    //         const subOptions = option.values;
    //         if (subOptions) {
    //             const subResult = this.buildOptions(
    //                 side,
    //                 subOptions,
    //                 selected,
    //                 hilighted,
    //                 searchTermRegExp,
    //                 handleOptionHilightedToggle
    //             );

    //             if (subResult.render.length > 0) {
    //                 result.render.push(
    //                     <div
    //                         className='group'
    //                         key={subOptions[0].value}
    //                         label={option.text}
    //                     >
    //                         { subResult.render.map(element => element) }
    //                     </div>
    //                 )
    //             }
    //         } else {
    //             const key = option.value;

    //             if (selected[key] === side &&
    //                 TwoColumnList.filterOption(option, searchTermRegExp)) {
    //                 result.render.push(
    //                     <div
    //                         className={`option ${hilighted[key] ? 'selected' : ''}`}
    //                         key={key}
    //                         value={key}
    //                         onClick={() => handleOptionHilightedToggle(option)}
    //                     >
    //                         {option.text}
    //                     </div>
    //                 );
    //             }
    //         }
    //     });

    //     return result;
    // }
    static filterLists(options, leftSelected, rightSelected, leftRegExp, rightRegExp) {
        const filters = {
            left: {},
            right: {}
        };

        TwoColumnList.iterateOptions(options, option => {
            const key = option.value;

            if (leftSelected[key] && TwoColumnList.filterOption(option, leftRegExp)) {
                filters.left[key] = true;
            }
            if (rightSelected[key] && TwoColumnList.filterObject(option, rightRegExp)) {
                filters.right[key] = true;
            }
        });

        return filters;
    }

    static filterList(options, selected, searchTermRegExp) {
        const filtered = {
        };

        TwoColumnList.iterateOptions(options, option => {
            const key = option.value;

            if (selected[key] && TwoColumnList.filterOption(option, searchTermRegExp)) {
                filtered[key] = true;
            }
        });

        return filtered;
    }

    filterOptions() {
        const results = {};

        if (this.state.leftSearchTerm) {
            const leftRegExp = new RegExp(this.state.leftSearchTerm, 'i');
            results.left = TwoColumnList.filterList(
                this.props.options,
                this.state.leftSelected,
                leftRegExp
            );
        } else {
            results.left = { ...this.state.leftSelected };
        }

        if (this.state.rightSearchTerm) {
            const rightRegExp = new RegExp(this.state.rightSearchTerm, 'i');
            results.right = TwoColumnList.filterList(
                this.props.options,
                this.state.rightSelected,
                rightRegExp
            );
        } else {
            results.right = { ...this.state.rightSelected };
        }

        return results;
    }

    render() {
        const filtered = this.filterOptions();

        const leftOptions = this.props.options.map(option =>
            this.renderOption(
                option,
                this.state.leftSelected,
                this.state.leftHilighted,
                filtered.left,
                this.handleLeftOptionHilightedToggle
            )
        );
        const rightOptions = this.props.options.map(option =>
            this.renderOption(
                option,
                this.state.rightSelected,
                this.state.rightHilighted,
                filtered.right,
                this.handleRightOptionHilightedToggle
            )
        );

        return (
            <div className='two-column-list'>
                {
                    this.props.leftTitle &&
                        <div className='title left'>
                            {this.props.leftTitle}
                        </div>
                }
                {
                    this.props.rightTitle &&
                        <div className='title right'>
                            {this.props.rightTitle}
                        </div>
                }
                {
                    this.props.leftSearch &&
                        <div className='search-bar left'>
                            <input
                                type='text'
                                placeholder='Type filter term...'
                                value={this.state.leftSearchTerm}
                                onChange={ event => this.setState({ leftSearchTerm: event.target.value }) }
                            />
                            <FontAwesomeIcon
                                className={`clear + ${!this.state.leftSearchTerm ? 'hidden' : ''}`}
                                icon={faTimesCircle}
                                onClick={ _ => this.setState({ leftSearchTerm: '' })}
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
                                onChange={ event => this.setState({ rightSearchTerm: event.target.value }) }
                            />
                            <FontAwesomeIcon
                                className={`clear + ${!this.state.rightSearchTerm ? 'hidden' : ''}`}
                                icon={faTimesCircle}
                                onClick={ _ => this.setState({ rightSearchTerm: '' })}
                            />
                        </div>
                }
                <div
                    className='list left'
                    ref={this.leftSelectRef}
                >
                    {leftOptions}
                </div>
                <div
                    className='list right'
                    ref={this.rightSelectRef}
                >
                    {rightOptions}
                </div>
                <div
                    className='toolbar left'
                >
                    {
                        this.renderToolbar(
                            filtered.left,
                            this.state.leftHilighted,
                            this.handleHilightAllLeft.bind(this, filtered.left),
                            this.handleHilightInvertLeft.bind(this, filtered.left),
                            this.handleHilightNoneLeft
                        )
                    }
                </div>
                <div
                    className='toolbar right'
                >
                    {
                        this.renderToolbar(
                            filtered.right,
                            this.state.rightHilighted,
                            this.handleHilightAllRight.bind(this, filtered.right),
                            this.handleHilightInvertRight.bind(this, filtered.right),
                            this.handleHilightNoneRight
                        )
                    }
                </div>

                <div className='vertical-toolbar middle'>
                    {
                        this.props.buttonOrder.map(this.renderButton)
                    }
                </div>
            </div>
        );
    }
}
