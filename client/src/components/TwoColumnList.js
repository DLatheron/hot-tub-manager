import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faAngleDoubleLeft, faAngleDoubleRight, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { HTTP_VERSION_NOT_SUPPORTED } from 'http-status-codes';

// TODO:
// - Support for single of multiple selections???
// - Data from data structure...
//   - Support for optgroup
// - Highlight colour support (trick);
// - Move left;
// - Move all left;
// - Move right;
// - Move all right;
// - Move up;
// - Move down;
// - Autosort;
// - Preserve order;
// Filter;
// Clear filtering;
// Vertical centering of middle toolbar;
// Bottom toolbar optional;
// Titles;
// Titles optional;
// Search optional.
// Change handlers.

export default class TwoColumnList extends React.PureComponent {
    static propTypes = {
        options: PropTypes.array,
        selected: PropTypes.object,
        onSelectedChanged: PropTypes.func
    };

    static defaultProps = {
        options: [],
        selected: {},
        onSelectedChanged: () => {}
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
    }

    handleMoveLeft = () => {
        const selectedOptions = this.getSelectedOption(this.rightSelectRef.current);

        this.props.onSelectedChanged(TwoColumnList.removeFromSelection(
            this.props.selected,
            selectedOptions
        ));
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
    }

    handleMoveAllLeft = (event) => {
        this.props.onSelectedChanged({});
    }

    renderOption = (option, selectionState) => {
        if (option.values) {
            const subOptions = option.values.reduce((filtered, option) => {
                const renderResult = this.renderOption(option, selectionState);
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
            if ((this.props.selected[option.value] || false) === selectionState) {
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

    render() {
        return (
            <div className='two-column-list'>
                <div className='search-bar left'>
                    <input placeholder='Type search term...' />
                </div>
                <div className='search-bar right'>
                    <input placeholder='Type search term...' />
                </div>
                <div className='list left'>
                    <select ref={this.leftSelectRef} multiple>
                        {
                            this.props.options.map(
                                option => this.renderOption(option, false)
                            )
                        }
                    </select>
                </div>
                <div className='list right'>
                    <select ref={this.rightSelectRef} multiple>
                        {
                            this.props.options.map(
                                option => this.renderOption(option, true)
                            )
                        }
                    </select>
                </div>
                <div className='toolbar left'>
                    {/* Replace with just the number selected? */}
                    <button type='button'><FontAwesomeIcon icon={faArrowUp} /></button>
                    <button type='button'><FontAwesomeIcon icon={faArrowDown} /></button>
                </div>
                <div className='toolbar right'>
                    {/* Replace with just the number selected? */}
                    <button type='button'><FontAwesomeIcon icon={faArrowUp} /></button>
                    <button type='button'><FontAwesomeIcon icon={faArrowDown} /></button>
                </div>
                <div className='vertical-toolbar middle'>
                    {/* Allow the ordering of these to be customised. */}
                    <button type='button' onClick={this.handleMoveAllRight}><FontAwesomeIcon icon={faAngleDoubleRight} /></button>
                    <button type='button' onClick={this.handleMoveRight}><FontAwesomeIcon icon={faArrowRight} /></button>
                    <button type='button' onClick={this.handleMoveLeft}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    <button type='button' onClick={this.handleMoveAllLeft}><FontAwesomeIcon icon={faAngleDoubleLeft} /></button>
                </div>
            </div>
        );
    }
}
