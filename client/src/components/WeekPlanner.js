import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Styles from './WeekPlanner.scss';

const baseMoment = moment.utc('2017-01-01T00:00:00.000', moment.ISO_8601);
const minutesInADay = 24 * 60;

const controlStyles = {
    initialColumnWidth: parseInt(Styles.initialColumnWidth)
};

export class Range {
    /** Constructs a range class
     * @param {moment|String} start - Optional start of the time range.
     * @param {moment|String} end - Optional end of the time range.
     * @param {string} color - Optional colour associated with this range.
     */
    constructor(start, end, color) {
        this.start = start instanceof moment
            ? start
            : moment.utc(start, moment.ISO_8601);
        this.end = end instanceof moment
            ? end
            : moment.utc(end, moment.ISO_8601);

        if (color !== undefined) {
            this.color = color;
        }
    }

    /** Returns the unix timestamp for the start of the range to assist sorting.
     * @param {moment} range - The range to process.
     * @returns {number} The valueOf the 'range's start time as a unix timestamp.
     */
    static sortByStartTime(range) {
        return range.start.valueOf();
    }

    /** Clips the range (assuming that the ranges are overlapping in the first place).
     * @param {Range} clippingRange - The clipping range.
     * @returns {Range} The clipped range.
     */
    clipDateRange(clippingRange) {
        return new Range(
            this.start.isSameOrAfter(clippingRange.start)
                ? this.start
                : clippingRange.start,
            this.end.isSameOrBefore(clippingRange.end)
                ? this.end
                : clippingRange.end,
            this.color
        );
    }

    /** Determines if the two date ranges overlap.
     * @param {Range} other - The other range.
     * @returns {boolean} True if the ranges overlap, otherwise false.
     */
    overlaps(other) {
        return this.start.isBefore(other.end) && this.end.isAfter(other.start);
    }

    /** Calculates the duration of the range (in minutes) and then optionally modulos the number.
     * @param {number} modulo - Optional parameter to limit the range (to say a day).
     * @returns {number} The duration of the range (in minutes).
     */
    durationInMinutes(modulo = minutesInADay + 1) {
        let durationInMinutes = moment.utc(this.end).diff(this.start, 'minutes');
        if (modulo) {
            durationInMinutes = durationInMinutes % (minutesInADay + 1);
        }
        return durationInMinutes;
    }

    /** Creates a new range that encompases the original and all of the ranges passed (it is assumed that these
     * ranges are known to overlap).
     * @param {Array} ranges - Array of zero or more ranges to be merged.
     * @returns {Range} New range that contains results of the merge.
     * */
    mergeOverlappingRanges(ranges) {
        ranges = [this, ...ranges];

        function getMinStartMomentAsUnixTimestamp() {
            return ranges.reduce((min, p) => Math.min(min, p.start.valueOf()), ranges[0].start.valueOf());
        }
        function getMaxEndMomentAsUnixTimestamp() {
            return ranges.reduce((min, p) => Math.max(min, p.end.valueOf()), ranges[0].end.valueOf());
        }

        return new Range(
            moment.utc(getMinStartMomentAsUnixTimestamp()),
            moment.utc(getMaxEndMomentAsUnixTimestamp()),
            this.color
        );
    }

    /** Determines how the range is clipped by the provided range.
     * @param {Range} clipRange - Range that is to be removed.
     * @returns {object} An object containing two boolean properties ('startOutside' and 'endOutside') that indicate
     * if the start and end are outside of the 'clipRange'.
     */
    determineOverlaps(clipRange) {
        return {
            startOutside: this.start.isBefore(clipRange.start),
            endOutside: this.end.isAfter(clipRange.end)
        };
    }

    /** Convert the range into a string.
     * @returns A string representation of the range (for debugging purposes).
    */
    toString() {
        return `${this.start.toISOString()} - ${this.end.toISOString()} (${this.color})`;
    }
}

export class Helper {
    /** Calculates the time at the cursor position.
     * @param {number} clientX - x co-ordinate in client-space pixels (assuming 0 is extreme left).
     * @param {number} clientY - y co-ordinate in client-space pixels (assuming 0 is extreme top).
     * @returns {moment} Describing the date and time relative to baseMoment.
     */
    static calcTimeAt(target, clientX, clientY) {
        const bounds = target.getBoundingClientRect()

        // PRE-CALC START
        // TODO: Need to programmatically generate this... and associated SCSS...
        const columnWidths = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1];
        let total = 0;
        const accColumnWidths = columnWidths.map(value => total += value);

        const columnDetails = {
            widths: accColumnWidths,
            accumulatedWidth: total
        };
        // PRE-CALC END

        const constants = {
            // TODO: Can we generate these programmatically?
            originX: bounds.x,
            originY: bounds.y,
            rowHeight: bounds.height / 7,   // TODO: Days shown.
            columnWidth: (bounds.width - controlStyles.initialColumnWidth) / columnDetails.accumulatedWidth   // TODO: Width of first column.
        };

        // Translate to origin.
        const x = clientX - constants.originX;
        const y = clientY - constants.originY;

        const row = Math.min(Math.floor(y / constants.rowHeight), 6);
        const col = columnDetails.widths.findIndex((_, index) =>
            (x >= (columnDetails.widths[index - 1] || 0) * constants.columnWidth) && (x < columnDetails.widths[index] * constants.columnWidth)
        );

        const day = row;
        const mins = Math.floor(col * 15);

        return moment
            .utc(baseMoment)
            .add(day, 'days')
            .add(mins, 'minutes');
    }

    /** Calculates the CSS grid start and end columns for this row.
     * @param {moment} startOfRowMoment - The date and time at the start of the row.
     * @param {Range} range - The range to be displayed.
     * @returns {object} Containing the calculated 'gridColumn' and the 'caps' object which
     * determines if the 'start' and 'end' of the region should be capped.
     */
    static calcGridColumns(startOfRowMoment, range) {
        function calcGridColumn(timeMoment) {
            const timeOffsetInMinutes = timeMoment.diff(startOfRowMoment, 'minutes');
            return Math.round(timeOffsetInMinutes / 15 + 1);
        }

        const minColumn = 1;
        const maxColumn = (4 * 24) + 1;

        const startColumn = calcGridColumn(range.start);
        const endColumn = calcGridColumn(range.end);

        return {
            caps: {
                start: startColumn >= minColumn,
                end: endColumn <= maxColumn
            },
            gridColumn: `${Math.max(startColumn, minColumn)}/${Math.min(endColumn, maxColumn)}`,
        };
    }

    /** Generates a string containing the necessary classes for a section.
     * @param {boolean} startCap - True if a start cap is necessary, otherwise false.
     * @param {boolean} endCap - True if an end cap is necessary, otherwise false.
     * @param {string|Array} otherClasses - String of array of strings representing other classes to add.
     * @returns {string} A space separated string containing the required classes.
     */
    static calcCapsClasses(startCap, endCap, otherClasses = null) {
        const classes = [];

        if (startCap)     { classes.push('startCap'); }
        if (endCap)       { classes.push('endCap'); }
        if (otherClasses) { classes.push(otherClasses); }

        return classes.join(' ');
    }

    /** Returns an new drag range respecting the setting of grid mode and ensuring that
     * the start is chronologically before the end of the range.
     * @param {Range} dragRange - Range of the drag operation.
     * @param {Boolean} gridMode - Whether grid mode is on or off.
     * @returns {Range} The range updated to ensure that start is chronologially before
     * end and that is respects the grid mode setting.
     */
    static getModeDependentDragRange(dragRange, gridMode) {
        if (gridMode) {
            const startDay = moment.utc(dragRange.start).startOf('day');
            const endDay = moment.utc(dragRange.end).startOf('day');
            const startOffsetInMins = dragRange.start.diff(startDay, 'minutes');
            const endOffsetInMins = dragRange.end.diff(endDay, 'minutes');

            const minDay = startDay <= endDay ? startDay : endDay;
            const minOffsetInMins = startOffsetInMins <= endOffsetInMins ? startOffsetInMins : endOffsetInMins;
            const maxDay = startDay <= endDay ? endDay : startDay;
            const maxOffsetInMins = startOffsetInMins <= endOffsetInMins ? endOffsetInMins : startOffsetInMins;

            return new Range(
                minDay.add(minOffsetInMins, 'minutes'),
                maxDay.add(maxOffsetInMins, 'minutes').add(15, 'minutes')
            );
        } else {
            return new Range(
                dragRange.start.isSameOrBefore(dragRange.end)
                    ? dragRange.start
                    : dragRange.end,
                moment.utc(
                    dragRange.start.isSameOrBefore(dragRange.end)
                        ? dragRange.end
                        : dragRange.start
                ).add(15, 'minutes')
            );
        }
    }

    /** Determine the impact of the selection on the day's row.
     * @param {Range} dayRange - Range of the day's row.
     * @param {Range|undefined} dragRange - Optional range for how the drag interacts with this row.
     * @param {Boolean} gridMode - Whether grid mode is on or off.
     * @param {String} modeIndicator - String drawn on the selection.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineSelection(dayRange, dragRange, gridMode, modeIndicator) {
        if (!dragRange) {
            return;
        }

        const correctedDragRange = Helper.getModeDependentDragRange(dragRange, gridMode);
        const selectionFn = (gridMode) ? Helper.determineGridModeSelection : Helper.determineContinuousSelection;

        return selectionFn(dayRange, correctedDragRange, modeIndicator);
    }

    /** Determines the impact of the selection on the day's row when gridMode is off.
     * @param {Range} dayRange - Range of teh day's row..
     * @param {Range} dragRange - Range of the drag operation.
     * @param {String} modeIndicator - String drawn on the selection.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineContinuousSelection(dayRange, dragRange, modeIndicator) {
        if (dragRange.overlaps(dayRange)) {
            const clippedMoments = dragRange.clipDateRange(dayRange);
            const { gridColumn, caps } = Helper.calcGridColumns(dayRange.start, clippedMoments);

            return (
                <li
                    key='selection'
                    className={Helper.calcCapsClasses(caps.start, caps.end, 'selection')}
                    style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}
                >
                    {modeIndicator}
                </li>
            );
        }
    }

    /** Determines the impact of the selection on the day's row when gridMode is on.
     * @param {Range} dayRange - Range of teh day's row..
     * @param {Range} dragRange - Range of the drag operation.
     * @param {String} modeIndicator - String drawn on the selection.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineGridModeSelection(dayRange, dragRange, modeIndicator) {
        const selectedDayRange = new Range(
            moment.utc(dragRange.start).startOf('day'),
            moment.utc(dragRange.end).subtract(1, 'minute').endOf('day')
        );

        if (selectedDayRange.overlaps(dayRange)) {
            const dragStart = moment.utc(dayRange.start).hour(dragRange.start.hour()).minute(dragRange.start.minute());
            const difference = dragRange.durationInMinutes();
            const dragEnd = moment.utc(dragStart).add(difference, 'minutes');
            const { gridColumn } = Helper.calcGridColumns(dayRange.start, new Range(dragStart, dragEnd));

            return (
                <li
                    key='selection'
                    className={Helper.calcCapsClasses(true, true, 'selection')}
                    style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}
                >
                    {modeIndicator}
                </li>
            );
        }
    }

    /** Calculates an updated set of ranges based on the drag selection that has taken place.
     * @param {Array} existingRanges - Array of the existing ranges.
     * @param {Range} dragRange - The range describing the drag operation.
     * @param {Boolean} gridMode - Whether the drag operation is in grid mode or not.
     * @param {String} mode - The operation to perform.
     * @param {String} color - The colour for any new ranges.
     * @returns {Array} An updated array of ranges.
     */
    static updateRangesFromDragSelection(existingRanges, dragRange, gridMode, mode, color = 'magenta') {
        const operationFn = mode === 'add' ? Helper.updateRangesByAddition : Helper.updateRangesBySubtraction;
        const correctedDragRange = Helper.getModeDependentDragRange(dragRange, gridMode);

        if (gridMode) {
            _.range(7).forEach(dayIndex => {
                const dayMoment = moment.utc(baseMoment).add(dayIndex, 'days');
                const dayRange = new Range(dayMoment, moment.utc(dayMoment).endOf('day'));

                if (correctedDragRange.overlaps(dayRange)) {
                    const dragStartTime = moment.utc(dayMoment).hour(correctedDragRange.start.hour()).minute(correctedDragRange.start.minute());
                    const difference = correctedDragRange.durationInMinutes(correctedDragRange);
                    const dragEndTime = moment.utc(dragStartTime).add(difference, 'minutes');

                    existingRanges = operationFn(existingRanges, new Range(dragStartTime, dragEndTime, color));
                }
            })
        } else {
            existingRanges = operationFn(existingRanges, new Range(correctedDragRange.start, correctedDragRange.end, color));
        }

        return existingRanges;
    }

    /** Generates a new ranges array by merging in the new range. Assumes that the existing ranges are sorted and do
     * not overlap.
     * @param {array} existingRanges - Array of objects with 'start' and 'end' {moment}s sorted by their 'start' {moment}.
     * @param {Range} rangeToInsert - Range to insert.
     * @returns {array} Ordered array of 'Range's. Any ranges that are coalesed by the addition of the new range take
     * on the colour of the new range.
     */
    static updateRangesByAddition(existingRanges, rangeToInsert) {
        const ranges = [...existingRanges];

        const affectedRanges = _.remove(ranges, range => range.overlaps(rangeToInsert));
        ranges.push(rangeToInsert.mergeOverlappingRanges(affectedRanges));

        const sortedTimes = _.sortBy(ranges, Range.sortByStartTime);

        return sortedTimes;
    }

    /** Generates a new ranges array by merging in the new range. Assumes that the existing ranges are sorted and do
     * not overlap.
     * @param {array} existingRanges - Array of objects with 'start' and 'end' {moment}s sorted by their 'start' {moment}.
     * @param {Range} rangeToRemove - Range to remove.
     * @returns {array} Ordered array of 'Range's. Any ranges that are split with retain their original colour.
     */
    static updateRangesBySubtraction(existingRanges, rangeToRemove) {
        const ranges = [...existingRanges];

        const affectedRanges = _.remove(ranges, range => range.overlaps(rangeToRemove));

        affectedRanges.forEach(affectedRange => {
            const overlaps = affectedRange.determineOverlaps(rangeToRemove);
            const { color } = affectedRange

            if (overlaps.startOutside) {
                ranges.push(new Range(affectedRange.start, rangeToRemove.start, color));
            }
            if (overlaps.endOutside) {
                ranges.push(new Range(rangeToRemove.end, affectedRange.end, color));
            }
        });

        const sortedTimes = _.sortBy(ranges, Range.sortByStartTime);

        return sortedTimes;
    }
};

export default class WeekPlanner extends React.PureComponent {
    static propTypes = {
        initialRanges: PropTypes.arrayOf(PropTypes.instanceOf(Range)),
        markers: PropTypes.object,
        roundToNearestMinutes: PropTypes.number,
        hoverTimeHandler: PropTypes.func,
        selectTimeHandler: PropTypes.func
    };

    static defaultProps = {
        initialRanges: [],
        markers: {},
        roundToNearestMinutes: null,
        hoverTimeHandler: () => {},
        selectTimeHandler: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            ranges: props.initialRanges,
            drag: null,
            gridMode: false,
            mode: 'add'
        };
    }

    handleMouseDown = (event) => {
        if (event.button === 0) {
            // TODO: event.clientX/clientY needs converting into a different space.
            const start = Helper.calcTimeAt(event.target, event.clientX, event.clientY);

            this.setState({ drag: new Range(start, start) });
        }
    }

    handleMouseUp = (event) => {
        if (event.button === 0) {
            const { ranges, drag, gridMode, mode } = this.state;

            this.setState({
                ranges: Helper.updateRangesFromDragSelection(ranges, drag, gridMode, mode, 'magenta'),
                drag: null
            });
        }
    }

    handleKeyDown = (event) => {
        switch (event.key) {
            case 'Alt':
                this.setState({ gridMode: true });
                break;

            case 'Shift':
                this.setState({ mode: 'sub' });
                break;

            default:
                break;
        }
    }

    handleKeyUp = (event) => {
        switch (event.key) {
            case 'Alt':
                this.setState({ gridMode: false });
                break;

            case 'Escape':
                this.setState({ drag: null });
                break;

            case 'Shift':
                this.setState({ mode: 'add' });
                break;

            default:
                break;
        }
    }

    handleMouseMove = (event) => {
        // TODO: event.clientX/clientY needs converting into a different space.
        const hoverMoment = Helper.calcTimeAt(event.target, event.clientX, event.clientY);

        if (this.state.drag !== null) {
            this.setState({ drag: new Range(this.state.drag.start, hoverMoment) });
        }

        this.props.hoverTimeHandler(hoverMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event) => {
        // TODO: event.clientX/clientY needs converting into a different space.
        const clickMoment = Helper.calcTimeAt(event.target, event.clientX, event.clientY);

        this.props.selectTimeHandler(clickMoment);
    }

    // componentDidUpdate(prevProps, prevState) {
    //     Object.entries(this.props).forEach(([key, val]) =>
    //         prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    //     );
    //     Object.entries(this.state).forEach(([key, val]) =>
    //         prevState[key] !== val && console.log(`State '${key}' changed`)
    //     );
    // }

    renderHours = (hourColumn) => {
        const formattedHour = `${hourColumn.toString().padStart(2, '0')}:00`;

        return <span key={hourColumn}>{formattedHour}</span>;
    }

    renderDayRow = (dayRow) => {
        const { drag, gridMode, mode, ranges } = this.state;

        const dayMoment = moment.utc(baseMoment).add(dayRow, 'days');
        const dayMomentRange = new Range(dayMoment, moment.utc(dayMoment).endOf('day'));

        const selection = Helper.determineSelection(dayMomentRange, drag, gridMode, mode === 'add' ? '+' : '-');

        const dayRanges = ranges.filter(entry => entry.overlaps(dayMomentRange));
        const formattedDay = dayMoment.format('ddd');

        return (
            <div
                key={formattedDay}
                className="week-planner__row"
            >
                <div className="week-planner__row-first">{formattedDay}</div>
                <ul className="week-planner__row-bars">
                    {
                        dayRanges.map(dayRange => {
                            const { gridColumn, caps } = Helper.calcGridColumns(dayMoment, dayRange);

                            return (
                                <li
                                    key={gridColumn}
                                    className={Helper.calcCapsClasses(caps.start, caps.end)}
                                    style={{gridColumn, gridRow: 1, backgroundColor: dayRange.color || '#2ecaac'}}
                                />
                            );
                        })
                    }
                    { selection }
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div className="week-planner">
                {/* Table header */}
                <div className="week-planner__row week-planner__row--hours">
                    <div className="week-planner__row-first"></div>
                    {_.range(24).map(this.renderHours)}
                </div>
                {/* Column separators and vertical markers */}
                <div className="week-planner__row week-planner__row--lines">
                    {/* Make the days markers more configurable. */}
                    {/* Day label */}
                    <span />
                    {
                        _.range(4 * 24).map(index => {
                            const hours = Math.floor(index / 4);
                            const mins = (index % 4) * 15;
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                            const markedColor = this.props.markers[formattedTime];

                            return (
                                <span
                                    key={index}
                                    className={markedColor ? 'marker' : ''}
                                    style={{ backgroundColor: markedColor }}
                                />
                            );
                        })
                    }
                </div>
                {/* Event handling */}
                <div
                    tabIndex='0'
                    className="week-planner__row--selection"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onKeyDown={this.handleKeyDown}
                    onKeyUp={this.handleKeyUp}
                />
                {/* Rendering the contents of each day */}
                {_.range(7).map(this.renderDayRow)}
            </div>
        );
    }
}
