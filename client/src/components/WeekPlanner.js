import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './WeekPlanner.scss';

const baseMoment = moment.utc('2017-01-01T00:00:00.000', moment.ISO_8601);
const minutesInADay = 24 * 60;

export class Range {
    /** Constructs a range class
     * @param {moment} start - Optional start of the time range.
     * @param {moment} end - Optional end of the time range.
     * @param {string} color - Optional colour associated with this range.
     */
    constructor(start, end, color) {
        this.start = start;
        this.end = end;

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
    static calcTimeAt(clientX, clientY) {
        const constants = {
            // TODO: Can we generate these programmatically?
            originX: 80,
            originY: 59,
            rowHeight: 48,
            columnWidth: 65.703
        };

        // Translate to origin.
        const x = clientX - constants.originX;
        const y = clientY - constants.originY;

        const row = Math.min(Math.floor(y / constants.rowHeight), 6);
        const col = Math.floor(x / (constants.columnWidth / 4));

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
        const maxColumn = 96 + 1;

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

    /** Returns the start and end moments for a selection, ensuring that 'drag.start' comes before 'drag.end'
     * and that the 'gridMode' is respected. NOTE: Dates ranges must overlap by an amount, it is not sufficient
     * that they 'touch'.
     * @param {object} drag - Object with 'start' and 'end' {moment}s that represent the extents of the current drag operation.
     * @param {boolean} gridMode - Whether grid mode is on or off.
     * @returns {object} An object containing 'start' and 'end' {moment} properties that represent the selection such
     * that 'start' is chronologically before 'end'.
     */
    static getDragMoments(drag, gridMode) {
        if (gridMode) {
            const startDay = moment.utc(drag.start).startOf('day');
            const endDay = moment.utc(drag.end).startOf('day');
            const startOffsetInMins = drag.start.diff(startDay, 'minutes');
            const endOffsetInMins = drag.end.diff(endDay, 'minutes');

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
                drag.start.isSameOrBefore(drag.end)
                    ? drag.start
                    : drag.end,
                moment.utc(
                    drag.start.isSameOrBefore(drag.end)
                        ? drag.end
                        : drag.start
                ).add(15, 'minutes')
            );
        }
    }

    /** Determine the impact of the selection on the day's row.
     * @param {object} dayMomentRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {object} drag - Optional object with 'start' and 'end' {moment}s that represent the extents of the current drag operation.
     * @param {boolean} gridMode - Whether grid mode is on or off.
     * @param {string} modeIndicator - String drawn on the selection.
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineSelection(dayMomentRange, drag, gridMode, modeIndicator) {
        if (!drag) {
            return;
        }

        const dragMoments = Helper.getDragMoments(drag, gridMode);
        const selectionFn = (gridMode) ? Helper.determineGridModeSelection : Helper.determineContinuousSelection;

        return selectionFn(dayMomentRange, dragMoments, modeIndicator);
    }

    /** Determines the impact of the selection on the day's row when gridMode is off.
     * @param {object} dayMomentRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {object} dragMoment - Object with 'start' and 'end' {moment}s that represent the start and end of the
     * selection, with 'start' guaranteed to be before 'end'
     * @param {string} modeIndicator - String drawn on the selection.
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineContinuousSelection(dayMomentRange, dragMoments, modeIndicator) {
        if (dragMoments.overlaps(dayMomentRange)) {
            const clippedMoments = dragMoments.clipDateRange(dayMomentRange);
            const { gridColumn, caps } = Helper.calcGridColumns(dayMomentRange.start, clippedMoments);

            return (
                <li
                    className={Helper.calcCapsClasses(caps.start, caps.end, 'selection')}
                    style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}
                >
                    {modeIndicator}
                </li>
            );
        }
    }

    /** Determines the impact of the selection on the day's row when gridMode is on.
     * @param {object} dayRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {object} dragMoment - Object with 'start' and 'end' {moment}s that represent the start and end of the
     * selection, with 'start' guaranteed to be before 'end'
     * @param {string} modeIndicator - String drawn on the selection.
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineGridModeSelection(dayRange, dragRange, modeIndicator) {
        const selectionDayRange = new Range(
            moment.utc(dragRange.start).startOf('day'),
            moment.utc(dragRange.end).subtract(1, 'minute').endOf('day')
        );

        if (selectionDayRange.overlaps(dayRange)) {
            const dragStart = moment.utc(dayRange.start).hour(dragRange.start.hour()).minute(dragRange.start.minute());
            const difference = dragRange.durationInMinutes();
            const dragEnd = moment.utc(dragStart).add(difference, 'minutes');
            const { gridColumn } = Helper.calcGridColumns(dayRange.start, new Range(dragStart, dragEnd));

            return (
                <li
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
     * @param {Range} drag - The range describing the drag operation.
     * @param {boolean} gridMode - Whether the drag operation is in grid mode or not.
     * @param {String} mode - The operation to perform.
     * @param {String} color - The colour for any new ranges.
     * @returns {Array} An updated array of ranges.
     */
    static updateRangesFromDragSelection(existingRanges, drag, gridMode, mode, color = 'magenta') {
        const operationFn = mode === 'add' ? Helper.updateRangesByAddition : Helper.updateRangesBySubtraction;
        const dragRange = Helper.getDragMoments(drag, gridMode);

        if (gridMode) {
            _.range(7).forEach(dayIndex => {
                const dayMoment = moment.utc(baseMoment).add(dayIndex, 'days');
                const dayRange = new Range(dayMoment, moment.utc(dayMoment).endOf('day'));

                if (dragRange.overlaps(dayRange)) {
                    const dragStartTime = moment.utc(dayMoment).hour(dragRange.start.hour()).minute(dragRange.start.minute());
                    const difference = dragRange.durationInMinutes(dragRange);
                    const dragEndTime = moment.utc(dragStartTime).add(difference, 'minutes');

                    existingRanges = operationFn(existingRanges, new Range(dragStartTime, dragEndTime, color))
                }
            })
        } else {
            existingRanges = operationFn(existingRanges, { ...dragRange, color })
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
        roundToNearestMinutes: PropTypes.number,
        hoverTimeHandler: PropTypes.func,
        selectTimeHandler: PropTypes.func
    };

    static defaultProps = {
        roundToNearestMinutes: null,
        hoverTimeHandler: () => {},
        selectTimeHandler: () => {}
    };

    state = {
        times: [
            new Range(moment.utc('2017-01-02T00:00:00.000'), moment.utc('2017-01-02T22:15:00.000'), 'red' ),
            new Range(moment.utc('2017-01-03T00:00:00.000'), moment.utc('2017-01-03T22:30:00.000'), 'green' ),
            new Range(moment.utc('2017-01-04T00:00:00.000'), moment.utc('2017-01-04T22:45:00.000'), 'blue' ),
            new Range(moment.utc('2017-01-05T00:00:00.000'), moment.utc('2017-01-05T23:00:00.000'), 'yellow' ),
            new Range(moment.utc('2017-01-06T02:00:00.000'), moment.utc('2017-01-07T23:00:00.000'), 'pink' )
        ],
        drag: null,
        gridMode: true,
        mode: 'add'
    };

    handleMouseDown = (event) => {
        if (event.button === 0) {
            const start = Helper.calcTimeAt(event.clientX, event.clientY);

            this.setState({ drag: new Range(start, start) });
        }
    }

    handleMouseUp = (event) => {
        if (event.button === 0) {
            const { times, drag, gridMode, mode } = this.state;

            this.setState({
                times: Helper.updateRangesFromDragSelection(times, drag, gridMode, mode, 'magenta'),
                drag: null
            });
        }
    }

    handleMouseMove = (event) => {
        const hoverMoment = Helper.calcTimeAt(event.clientX, event.clientY);

        if (this.state.drag !== null) {
            this.setState({ drag: new Range(this.state.drag.start, hoverMoment) });
        }

        this.props.hoverTimeHandler(hoverMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event) => {
        const clickMoment = Helper.calcTimeAt(event.clientX, event.clientY);

        this.props.selectTimeHandler(clickMoment);
    }

    // componentDidUpdate(prevProps, prevState) {
    //     Object.entries(this.props).forEach(([key, val]) =>
    //       prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    //     );
    //     Object.entries(this.state).forEach(([key, val]) =>
    //       prevState[key] !== val && console.log(`State '${key}' changed`)
    //     );
    // }

    renderHours = (hourColumn) => {
        const formattedHour = `${hourColumn.toString().padStart(2, '0')}:00`;

        return <span key={hourColumn}>{formattedHour}</span>;
    }

    renderDayRow = (dayRow) => {
        const { drag, gridMode, mode, times } = this.state;

        const dayMoment = moment.utc(baseMoment).add(dayRow, 'days');
        const dayMomentRange = new Range(dayMoment, moment.utc(dayMoment).endOf('day'));

        const selection = Helper.determineSelection(dayMomentRange, drag, gridMode, mode === 'add' ? '+' : '-');

        const dayTimes = times.filter(entry => entry.overlaps(dayMomentRange));
        const formattedDay = dayMoment.format('ddd');

        return (
            <div className="week-planner__row">
                <div className="week-planner__row-first">{formattedDay}</div>
                <ul className="week-planner__row-bars">
                    {
                        dayTimes.map(dayTime => {
                            const { gridColumn, caps } = Helper.calcGridColumns(dayMoment, dayTime);

                            return (
                                <li
                                    key={gridColumn}
                                    className={Helper.calcCapsClasses(caps.start, caps.end)}
                                    style={{gridColumn, gridRow: 1, backgroundColor: dayTime.color || '#2ecaac'}}
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
                            const marked = index >= 0 && index < 4;

                            return <span key={index} className={marked ? 'marker' : ''} />;
                        })
                    }
                </div>
                {/* Event handling */}
                <div
                    className="week-planner__row--selection"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                />
                {/* Rendering the contents of each day */}
                {_.range(7).map(this.renderDayRow)}
            </div>
        );
    }
}
