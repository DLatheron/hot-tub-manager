import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faArrowLeft,
    faArrowRight,
    faTimesCircle
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
        selected: PropTypes.object,
        onSelectedChanged: PropTypes.func,
        buttonOrder: PropTypes.arrayOf(PropTypes.string)
    };

    static defaultProps = {
        leftTitle: 'All Options:',
        rightTitle: 'Active:',
        leftSearch: true,
        rightSearch: true,
        options: [],
        selected: {},
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

    static addToSelection(existingSelection, selectionsToAdd) {
        const newSelection = {
            ...existingSelection,
            ...selectionsToAdd
        };

        return newSelection;
    }

    static removeFromSelection(existingSelection, selectionsToRemove) {
        const newSelection = { ...existingSelection };

        Object.keys(selectionsToRemove).forEach(key => {
            delete newSelection[key];
        });

        return newSelection;
    }

    handleMoveRight = () => {
        const selectedOptions = this.getSelectedOption(this.leftSelectRef.current);

        this.props.onSelectedChanged(TwoColumnList.addToSelection(
            this.props.selected,
            selectedOptions
        ));
        this.leftSelectRef.current.selectedIndex = -1;
    }

    handleMoveLeft = () => {
        const selectedOptions = this.getSelectedOption(this.rightSelectRef.current);

        this.props.onSelectedChanged(TwoColumnList.removeFromSelection(
            this.props.selected,
            selectedOptions
        ));
        this.rightSelectRef.current.selectedIndex = -1;
    }

    handleMoveAllRight = (event) => {
        const allSelected = {};

        this.props.options.forEach(option => {
            if (option.values) {
                option.values.forEach(subOption => {
                    allSelected[subOption.value] = true;
                });
            } else {
                allSelected[option.value] = true;
            }
        });

        this.props.onSelectedChanged(allSelected);
        this.leftSelectRef.current.selectedIndex = -1;
    }

    handleMoveAllLeft = (event) => {
        this.props.onSelectedChanged({});
        this.rightSelectRef.current.selectedIndex = -1;
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

    handleSelectChange = () => {
        this.forceUpdate();
    }

    canMoveAllToRight() {
        return Object.keys(this.props.selected).length < 13;
    }

    canMoveAllToLeft() {
        return Object.keys(this.props.selected).length > 0;
    }

    canMoveToRight() {
        return this.leftSelectRef.current && this.leftSelectRef.current.selectedIndex !== -1;
    }

    canMoveToLeft() {
        return this.rightSelectRef.current && this.rightSelectRef.current.selectedIndex !== -1;
    }

    renderOption = (option, selectionState, regExp) => {
        if (option.values) {
            const subOptions = option.values.reduce((filtered, option) => {
                const renderResult = this.renderOption(option, selectionState, regExp);
                if (renderResult) {
                    filtered.push(renderResult);
                }
                return filtered;
            }, []);

            if (subOptions.length > 0) {
                // Group.
                return (
                    <optgroup
                        key={option.values[0].value}
                        label={option.text}
                    >
                        {subOptions}
                    </optgroup>
                );
            }
        } else {
            if ((this.props.selected[option.value] || false) === selectionState
                && TwoColumnList.filterOption(option, regExp)) {
                return (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.text}
                    </option>
                );
            }
        }
    }

    renderButton = (buttonType) => {
        switch (buttonType) {
            case 'MoveAllRight':
                return (
                    <button
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

    render() {
        const leftRegExp = this.state.leftSearchTerm && new RegExp(`/${this.state.leftSearchTerm}/i`);
        const rightRegExp = this.state.rightSearchTerm && new RegExp(`/${this.state.rightSearchTerm}/i`);

        return (
            <div className='two-column-list'>
                {
                    this.props.leftTitle &&
                        <div className='title left'>
                            {this.props.leftTitle}
                            <hr/>
                        </div>
                }
                {
                    this.props.rightTitle &&
                        <div className='title right'>
                            {this.props.rightTitle}
                            <hr/>
                        </div>
                }
                {
                    this.props.leftSearch &&
                        <div className='search-bar left'>
                            <input
                                type='text'
                                placeholder='Type search term...'
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
                                placeholder='Type search term...'
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
                <div className='list left'>
                    <select
                        ref={this.leftSelectRef}
                        onChange={this.handleSelectChange}
                        multiple
                    >
                        {
                            this.props.options.map(
                                option => this.renderOption(option, false, leftRegExp)
                            )
                        }
                    </select>
                </div>
                <div className='list right'>
                    <select
                        ref={this.rightSelectRef}
                        onChange={this.handleSelectChange}
                        multiple
                    >
                        {
                            this.props.options.map(
                                option => this.renderOption(option, true, rightRegExp)
                            )
                        }
                    </select>
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
