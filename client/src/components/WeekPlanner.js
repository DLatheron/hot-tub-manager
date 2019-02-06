import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './WeekPlanner.scss';

const baseMoment = moment.utc('2017-01-01T00:00:00.000', moment.ISO_8601);
const minutesInADay = 24 * 60;

export class Helper {
    /** Calculates the time at the cursor position.
     * @param {number} clientX - x co-ordinate in client-space pixels (assuming 0 is extreme left).
     * @param {number} clientY - y co-ordinate in client-space pixels (assuming 0 is extreme top).
     * @returns {moment} Describing the date and time relative to baseMoment.
     */
    static calcTimeAt(clientX, clientY) {
        const constants = {
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
     * @param {moment} startMoment - The date and time at the start of the region.
     * @param {moment} endMoment - The date and time at the end of the region.
     * @returns {object} Containing the calculated 'gridColumn' and the 'caps' object which
     * determines if the start and end of the region should be capped.
     */
    static calcGridColumns(startOfRowMoment, startMoment, endMoment) {
        function calcGridColumn(timeMoment) {
            const timeOffsetInMinutes = timeMoment.diff(startOfRowMoment, 'minutes');
            return Math.round(timeOffsetInMinutes / 15 + 1);
        }

        const minColumn = 1;
        const maxColumn = 96 + 1;

        const startColumn = calcGridColumn(startMoment);
        const endColumn = calcGridColumn(endMoment);

        return {
            caps: {
                start: startColumn >= minColumn,
                end: endColumn <= maxColumn
            },
            gridColumn: `${Math.max(startColumn, minColumn)}/${Math.min(endColumn, maxColumn)}`,
        };
    }

    /** Determines if the two date ranges overlap.
     * @param {object} range0 - An object with 'start' and 'end' {moment} properties defining the first range.
     * @param {object} range1 - An object with 'start' and 'end' {moment} properties defining the second range.
     * @returns {boolean} True if the ranges overlap, otherwise false.
     */
    static dateRangesOverlap(range0, range1) {
        return range0.start.isBefore(range1.end) && range0.end.isAfter(range1.start);
    }

    /** Clips a date range into another range (assuming that the ranges are overlapping in the first place).
     * @param {object} toClip - An object with 'start' and 'end' {moment} properties defining the range to clip.
     * @param {object} range - An object with 'start' and 'end' {moment} properties defining the clipping range.
     * @returns {object} The resulting clipped range with 'start' and 'end' {moment} properties.
     */
    static clipDateRange(toClip, range) {
        return {
            start: toClip.start.isSameOrAfter(range.start) ? toClip.start : range.start,
            end: toClip.end.isSameOrBefore(range.end) ? toClip.end : range.end
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

    /** Returns the start and end moments for a selection, ensuring that 'dragStart' comes before 'dragEnd'
     * and that the 'gridMode' is respected. NOTE: Dates ranges must overlap by an amount, it is not sufficient
     * that they 'touch'.
     * @param {moment} dragStart - The moment where the drag operation began.
     * @param {moment} dragEnd - The moment where the drag operation ends.
     * @param {boolean} gridMode - Whether grid mode is on or off.
     * @returns {object} An object containing 'start' and 'end' {moment} properties that represent the selection such
     * that 'start' is chronologically before 'end'.
     */
    static getDragMoments(dragStart, dragEnd, gridMode) {
        if (gridMode) {
            const startDay = moment.utc(dragStart).startOf('day');
            const endDay = moment.utc(dragEnd).startOf('day');
            const startOffsetInMins = dragStart.diff(startDay, 'minutes');
            const endOffsetInMins = dragEnd.diff(endDay, 'minutes');

            const minDay = startDay <= endDay ? startDay : endDay;
            const minOffsetInMins = startOffsetInMins <= endOffsetInMins ? startOffsetInMins : endOffsetInMins;
            const maxDay = startDay <= endDay ? endDay : startDay;
            const maxOffsetInMins = startOffsetInMins <= endOffsetInMins ? endOffsetInMins : startOffsetInMins;

            return {
                start: minDay.add(minOffsetInMins, 'minutes'),
                end: maxDay.add(maxOffsetInMins, 'minutes').add(15, 'minutes')
            };
        } else {
            return {
                start: dragStart.isSameOrBefore(dragEnd)
                    ? dragStart
                    : dragEnd,
                end: moment.utc(
                    dragStart.isSameOrBefore(dragEnd)
                        ? dragEnd
                        : dragStart
                ).add(15, 'minutes')
            };
        }
    }

    /** Determine the impact of the selection on the day's row.
     * @param {object} dayMomentRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {moment} dragStart - The moment where the drag operation began.
     * @param {moment} dragEnd - The moment where the drag operation ends.
     * @param {boolean} gridMode - Whether grid mode is on or off.
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineSelection(dayMomentRange, dragStart, dragEnd, gridMode) {
        if (!dragStart || !dragEnd) {
            return;
        }

        const dragMoments = Helper.getDragMoments(dragStart, dragEnd, gridMode);
        const selectionFn = (gridMode) ? Helper.determineGridModeSelection : Helper.determineContinuousSelection;

        return selectionFn(dayMomentRange, dragMoments);
    }

    /** Determines the impact of the selection on the day's row when gridMode is off.
     * @param {object} dayMomentRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {object} dragMoment - Object with 'start' and 'end' {moment}s that represent the start and end of the
     * selection, with 'start' guaranteed to be before 'end'
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineContinuousSelection(dayMomentRange, dragMoments) {
        if (Helper.dateRangesOverlap(dragMoments, dayMomentRange)) {
            const clippedMoments = Helper.clipDateRange(dragMoments, dayMomentRange);
            const { gridColumn, caps } = Helper.calcGridColumns(dayMomentRange.start, clippedMoments.start, clippedMoments.end);

            return (
                <li
                    className={Helper.calcCapsClasses(caps.start, caps.end, 'selection')}
                    style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}
                >
                    +
                </li>
            );
        }
    }

    /** Determines the impact of the selection on the day's row when gridMode is on.
     * @param {object} dayMomentRange - Object with 'start' and 'end' {moment}s that represent the extents of the current
     * day's row.
     * @param {object} dragMoment - Object with 'start' and 'end' {moment}s that represent the start and end of the
     * selection, with 'start' guaranteed to be before 'end'
     * @returns {component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineGridModeSelection(dayMomentRange, dragMoments) {
        const selectionDayRange = {
            start: moment.utc(dragMoments.start).startOf('day'),
            end: moment.utc(dragMoments.end).subtract(1, 'minute').endOf('day')
        };

        if (Helper.dateRangesOverlap(selectionDayRange, dayMomentRange)) {
            const dragStartTime = moment.utc(dayMomentRange.start).hour(dragMoments.start.hour()).minute(dragMoments.start.minute());
            const difference = Helper.calcDifferenceInMinutesClamped(dragMoments);
            const dragEndTime = moment.utc(dragStartTime).add(difference, 'minutes');
            const { gridColumn } = Helper.calcGridColumns(dayMomentRange.start, dragStartTime, dragEndTime);

            return (
                <li
                    className={Helper.calcCapsClasses(true, true, 'selection')}
                    style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}
                >
                    +
                </li>
            );
        }
    }

    /** Calculates the number of minutes between 'start' and 'end' {moment}s and limits it to a maximum of one day
     * (+1 second). The +1 second is required because a section can extend from 00:00 today to 00:00 tomorrow.
     * @param {object} momentRange - Object with 'start' and 'end' {moment}s representing the (potentially multi-day) time range.
     * @returns {number} The number of minutes between them
     */
    static calcDifferenceInMinutesClamped(momentRange) {
        return moment.utc(momentRange.end).diff(momentRange.start, 'minutes') % (minutesInADay + 1);
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
            { start: moment.utc('2017-01-02T00:00:00.000'), end: moment.utc('2017-01-02T00:15:00.000'), color: 'red' },
            { start: moment.utc('2017-01-03T00:00:00.000'), end: moment.utc('2017-01-03T00:30:00.000'), color: 'green' },
            { start: moment.utc('2017-01-04T00:00:00.000'), end: moment.utc('2017-01-04T00:45:00.000'), color: 'blue' },
            { start: moment.utc('2017-01-05T00:00:00.000'), end: moment.utc('2017-01-05T01:00:00.000'), color: 'yellow' },
            { start: moment.utc('2017-01-06T23:00:00.000'), end: moment.utc('2017-01-07T01:00:00.000'), color: 'pink' },
            { start: moment.utc('2017-01-04T09:00:00.000'), end: moment.utc('2017-01-04T10:00:00.000'), color: 'pink' },
        ],
        dragStart: null,
        dragEnd: null,
        gridMode: false
    };

    handleMouseDown = (event) => {
        if (event.button === 0) {
            const dragStart = Helper.calcTimeAt(event.clientX, event.clientY);

            this.setState({
                dragStart,
                dragEnd: null
            });
        }
    }

    handleMouseUp = (event) => {
        if (event.button === 0) {
            const { dragStart, dragEnd, gridMode } = this.state;

            // TODO: Do something with the selection...
            console.log(`Dragging completed: dragStart: ${dragStart}, dragEnd: ${dragEnd}, gridMode: ${gridMode}`);

            this.setState({
                dragStart: null
            });
        }
    }

    handleMouseMove = (event) => {
        const hoverMoment = Helper.calcTimeAt(event.clientX, event.clientY);

        if (this.state.dragStart !== null) {
            this.setState({
                dragEnd: hoverMoment
            });
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
        const { dragStart, dragEnd, gridMode, times } = this.state;

        const dayMoment = moment.utc(baseMoment).add(dayRow, 'days');
        const dayMomentRange = {
            start: dayMoment,
            end: moment.utc(dayMoment).endOf('day')
        };

        const selection = Helper.determineSelection(dayMomentRange, dragStart, dragEnd, gridMode);

        const dayTimes = times.filter(entry => Helper.dateRangesOverlap(entry, dayMomentRange));
        const formattedDay = dayMoment.format('ddd');

        return (
            <div className="week-planner__row">
                <div className="week-planner__row-first">{formattedDay}</div>
                <ul className="week-planner__row-bars">
                    {
                        dayTimes.map(dayTime => {
                            const { gridColumn, caps } = Helper.calcGridColumns(dayMoment, dayTime.start, dayTime.end);

                            return (
                                <li
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
