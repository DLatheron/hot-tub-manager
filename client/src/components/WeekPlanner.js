import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from 'lodash';
import assert from 'assert';
import Popover, { ArrowContainer } from 'react-tiny-popover'

const baseMoment = moment.utc('2018-01-01T00:00:00.000', moment.ISO_8601);
const daysInAWeek = 7;
const hoursInADay = 24;
const segmentsPerHour = 4;
const segmentsPerDay = hoursInADay * segmentsPerHour;
const segmentSizeInMinutes = 60 / segmentsPerHour;
const minutesInADay = hoursInADay * 60;
const modes = {
    add: 'add',
    sub: 'sub'
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

    /** Determine if ranges are the same.
     * @param {Range} other - Range to compare.
     * @returns {Boolean} Whether the ranges are the same.
     */
    isSame(other) {
        return this.start.valueOf() === other.start.valueOf()
            && this.end.valueOf() === other.end.valueOf()
            && this.color === other.color;
    }

    /** Returns the unix timestamp for the start of the range to assist sorting.
     * @param {moment} range - The range to process.
     * @returns {number} The valueOf the 'range's start time as a unix timestamp.
     */
    static sortByStartTime(range) {
        return range.start.valueOf();
    }

    /** Determines if the two date ranges overlap.
     * @param {Range} other - The other range.
     * @returns {boolean} True if the ranges overlap, otherwise false.
     */
    overlaps(other) {
        return this.start.isBefore(other.end) && this.end.isAfter(other.start);
    }

    /** Determines if the two date ranges overlap or touch.
     * @param {Range} other - The other range.
     * @returns {boolean} True if the ranges overlap (or touch), otherwise false.
     */
    overlapsOrTouches(other) {
        return this.start.isSameOrBefore(other.end) && this.end.isSameOrAfter(other.start);
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
    static calcTimeAt(target, clientX, clientY, segmentSpacing) {
        const bounds = target.getBoundingClientRect()
        const constants = {
            originX: bounds.x,
            originY: bounds.y,
            rowHeight: bounds.height / daysInAWeek,
            columnWidth: (bounds.width - segmentSpacing.initialColumnWidthInPixels) / segmentSpacing.totalSpacing
        };

        const x = clientX - constants.originX;
        const y = clientY - constants.originY;

        const row = Math.min(Math.floor(y / constants.rowHeight), daysInAWeek - 1);
        const col = segmentSpacing.accumulatedSpacings.findIndex((_, index) =>
            (x >= (segmentSpacing.accumulatedSpacings[index - 1] || 0) * constants.columnWidth) && (x < segmentSpacing.accumulatedSpacings[index] * constants.columnWidth)
        );

        const day = row;
        const mins = Math.floor(col * segmentSizeInMinutes);

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
            return Math.round(timeOffsetInMinutes / segmentSizeInMinutes + 1);
        }

        const minColumn = 1;
        const maxColumn = segmentsPerDay + 1;

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
        if (otherClasses) { classes.push(...otherClasses); }

        return classes.join(' ');
    }

    /** Returns an new drag range respecting the setting of grid mode and
     * ensuring that the start is chronologically before the end of the range.
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
                maxDay.add(maxOffsetInMins, 'minutes').add(segmentSizeInMinutes, 'minutes')
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
                ).add(segmentSizeInMinutes, 'minutes')
            );
        }
    }

    /** Generates a duration from a range.
     * @param {Range} range - The range to convert.
     * @returns {String} The duration of the range as a string.
     */
    static generateDuration(range) {
        const { start, end } = range;
        const days = end.diff(start, 'days').toString();
        const hours = (end.diff(start, 'hours') % 24).toString();
        const mins = (end.diff(start, 'minutes') % 60).toString();
        if (days >= 1) {
            return `${days}d ${hours.padStart(2, '0')}h ${mins.padStart(2, '0')}m`;
        } else if (hours >= 1) {
            return `${hours}h ${mins.padStart(2, '0')}m`;
        } else {
            return `${mins}m`;
        }
    }

    /** Generate the text describing the selected range.
     * @param {Range} correctedDragRange - The current drag range (corrected so that start is before end).
     * @param {Boolean} gridMode - Whether grid selection mode is active.
     * @returns {String} A textual description of the range.
     */
    static generateSelectionText(correctedDragRange, gridMode) {
        const { start, end } = correctedDragRange;

        if (gridMode) {
            const duration = Helper.generateDuration({
                start: moment.utc(correctedDragRange.start).day(0),
                end: moment.utc(correctedDragRange.end).day(0)
            });

            return `${start.format('HH:mm')} to ${end.format('HH:mm')} (${duration}), ${start.format('ddd')} to ${end.format('ddd')}`;

        } else {
            const duration = Helper.generateDuration(correctedDragRange);

            return `${start.format('ddd HH:mm')} to ${end.format('ddd HH:mm')} (${duration})`;
        }
    }

    /** Determine the impact of the selection on the day's row.
     * @param {Range} dayRange - Range of the day's row.
     * @param {Range|undefined} dragRange - Optional range for how the drag interacts with this row.
     * @param {Boolean} gridMode - Whether grid mode is on or off.
     * @param {Object} modeDef - Definition of the mode.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineSelection(dayRange, dragRange, gridMode, modeDef) {
        if (!dragRange) {
            return;
        }

        const correctedDragRange = Helper.getModeDependentDragRange(dragRange, gridMode);
        const selectionFn = (gridMode) ? Helper.determineGridModeSelection : Helper.determineContinuousSelection;

        const selection = selectionFn(dayRange, correctedDragRange, modeDef);
        if (!selection) {
            return null;
        }

        const firstDay = dayRange.start.day() === correctedDragRange.start.day();
        if (firstDay) {
            return (
                <Popover
                    key={gridMode}  // Ensures that if the gridMode changes then this element is recreated.
                    className='popover'
                    isOpen={true}
                    position={['top', 'bottom']}
                    transitionDuration={0.2}
                    containerStyle={{ pointerEvents: 'none' }}
                    content={({ position, targetRect, popoverRect }) => (
                        <ArrowContainer
                            position={position}
                            targetRect={targetRect}
                            popoverRect={popoverRect}
                            arrowColor={'#444'}
                            arrowSize={12}
                            arrowStyle={{ opacity: 0.7, pointerEvents: 'none' }}
                            style={{ pointerEvents: 'none' }}
                        >
                            <div className='popover'>
                                {Helper.generateSelectionText(correctedDragRange, gridMode)}
                            </div>
                        </ArrowContainer>
                    )}
                >
                    {selection}
                </Popover>
            );
        }
        return selection;
    }

    /** Determines the impact of the selection on the day's row when gridMode is off.
     * @param {Range} dayRange - Range of teh day's row..
     * @param {Range} dragRange - Range of the drag operation.
     * @param {Object} modeDef - Definition of the mode.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineContinuousSelection(dayRange, dragRange, modeDef) {
        if (dragRange.overlaps(dayRange)) {
            const { gridColumn, caps } = Helper.calcGridColumns(dayRange.start, dragRange);

            return (
                <li
                    key='selection'
                    className={Helper.calcCapsClasses(caps.start, caps.end, modeDef.classNames)}
                    style={{ gridColumn, gridRow: 1 }}
                >
                    {modeDef.indicator}
                </li>
            );
        }
    }

    /** Determines the impact of the selection on the day's row when gridMode is on.
     * @param {Range} dayRange - Range of teh day's row..
     * @param {Range} dragRange - Range of the drag operation.
     * @param {Object} modeDef - Definition of the mode.
     * @returns {Component|undefined} An optional react component representing the selection's impact on the day's row.
     */
    static determineGridModeSelection(dayRange, dragRange, modeDef) {
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
                <Popover>
                <li
                    key='selection'
                    className={Helper.calcCapsClasses(true, true, modeDef.classNames)}
                    style={{ gridColumn, gridRow: 1 }}
                >
                    {modeDef.indicator}
                </li>
                </Popover>
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
    static updateRangesFromDragSelection(existingRanges, dragRange, gridMode, mode, color) {
        const operationFn = mode === modes.add ? Helper.updateRangesByAddition : Helper.updateRangesBySubtraction;
        const correctedDragRange = Helper.getModeDependentDragRange(dragRange, gridMode);

        if (gridMode) {
            _.range(daysInAWeek).forEach(dayIndex => {
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

        const affectedRanges = _.remove(ranges, range => range.overlapsOrTouches(rangeToInsert));
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

        const affectedRanges = _.remove(ranges, range => range.overlapsOrTouches(rangeToRemove));

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

    /** Calculates the segment spacing based on the initial column size and the relative spacing of each segment.
     * @param {Number} initialColumnWidthInPixels - The width of the first (header) column in pixels.
     * @param {Array} segmentSpacing - An array with a numeric value for the relative width of each column.
     * @returns {Object} An object suitable for setting as the WeekPlanner's 'segmentSpacing' property.
     */
    static calcSegmentSpacing(initialColumnWidthInPixels, segmentSpacing) {
        assert.strictEqual(segmentSpacing.length, segmentsPerDay);

        let totalSpacing = 0;
        let hourSpace = 0;
        let accumulatedSpacings = [];
        let gridTemplateColumns = [];
        let gridTemplateHeaderSpacings = [];

        for (let i = 0; i < segmentSpacing.length; ++i) {
            if (i % segmentsPerHour === 0) {
                hourSpace = 0;
            }

            const space = segmentSpacing[i];

            hourSpace += space;
            totalSpacing += space;
            accumulatedSpacings.push(totalSpacing);

            gridTemplateColumns.push(`${space}fr`);
            if (i % segmentsPerHour === segmentsPerHour - 1) {
                gridTemplateHeaderSpacings.push(`${hourSpace}fr`);
            }
        }

        return {
            initialColumnWidthInPixels: initialColumnWidthInPixels,
            gridTemplateColumns: gridTemplateColumns.join(' '),
            gridTemplateHeaderColumns: gridTemplateHeaderSpacings.join(' '),
            accumulatedSpacings,
            totalSpacing
        };
    }
};

export default class WeekPlanner extends React.PureComponent {
    static propTypes = {
        ranges: PropTypes.arrayOf(PropTypes.instanceOf(Range)),
        segmentSpacing: PropTypes.shape({
            initialColumnWidthInPixels: PropTypes.number,
            gridTemplateColumns: PropTypes.string,
            gridTemplateHeaderColumns: PropTypes.string,
            accumulatedSpacings: PropTypes.arrayOf(PropTypes.number),
            totalSpacing: PropTypes.number
        }),
        markers: PropTypes.object,
        modeDefs: PropTypes.object,
        defaultSegmentColor: PropTypes.string,
        hoverTimeHandler: PropTypes.func,
        rangesChangedHandler: PropTypes.func
    };

    static defaultProps = {
        ranges: [],
        segmentSpacing: Helper.calcSegmentSpacing(80, _.times(segmentsPerDay, _.constant(1))),
        markers: {},
        modeDefs: {
            add: {
                indicator: '+',
                classNames: ['selection', 'add-stripes']
            },
            sub: {
                indicator: '-',
                classNames: ['selection', 'sub-stripes']
            }
        },
        defaultSegmentColor: 'magenta',
        hoverTimeHandler: () => {},
        rangesChangedHandler: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            drag: null,
            gridMode: false,
            mode: modes.add
        };
    }

    determineMode({ altHeld, shiftHeld }) {
        const selectionState = {};

        if (altHeld !== undefined) {
            selectionState.gridMode = altHeld;
        }
        if (shiftHeld !== undefined) {
            selectionState.mode = shiftHeld ? modes.sub : modes.add;
        }

        return selectionState;
    }

    handleMouseDown = (event) => {
        if (event.button === 0) {
            const start = Helper.calcTimeAt(
                event.target,
                event.clientX,
                event.clientY,
                this.props.segmentSpacing
            );

            this.setState({
                ...this.determineMode({ altHeld: event.altKey, shiftHeld: event.shiftKey }),
                drag: new Range(start, start) });
        }
    }

    handleMouseUp = (event) => {
        if (event.button === 0) {
            const { ranges } = this.props;
            const { drag, gridMode, mode } = this.state;

            if (drag) {
                const updatedRanges = Helper.updateRangesFromDragSelection(ranges, drag, gridMode, mode, this.props.defaultSegmentColor);

                this.props.rangesChangedHandler(updatedRanges);
                this.setState({
                    drag: null
                });
            }
        }
    }

    handleKeyDown = (event) => {
        switch (event.key) {
            case 'Alt':
                this.setState(this.determineMode({ altHeld: true }));
                break;

            case 'Shift':
                this.setState(this.determineMode({ shiftHeld: true }));
                break;

            case 'Escape':
                this.setState({ drag: null });
                break;

            default:
                break;
        }
    }

    handleKeyUp = (event) => {
        switch (event.key) {
            case 'Alt':
                this.setState(this.determineMode({ altHeld: false }));
                break;

            case 'Shift':
                this.setState(this.determineMode({ shiftHeld: false }));
                break;

            default:
                break;
        }
    }

    handleMouseMove = (event) => {
        const hoverMoment = Helper.calcTimeAt(
            event.target,
            event.clientX,
            event.clientY,
            this.props.segmentSpacing
        );

        if (this.state.drag !== null) {
            const drag = new Range(this.state.drag.start, hoverMoment);
            if (!this.state.drag.isSame(drag)) {
                this.setState({ drag });
            }
        }

        this.props.hoverTimeHandler(hoverMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
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
        const { ranges } = this.props;
        const { drag, gridMode, mode } = this.state;

        const dayMoment = moment.utc(baseMoment).add(dayRow, 'days');
        const dayMomentRange = new Range(dayMoment, moment.utc(dayMoment).endOf('day'));

        const selection = Helper.determineSelection(
            dayMomentRange,
            drag,
            gridMode,
            mode === 'add'
                ? this.props.modeDefs.add
                : this.props.modeDefs.sub
        );

        const dayRanges = ranges.filter(entry => entry.overlaps(dayMomentRange));
        const formattedDay = dayMoment.format('ddd');

        return (
            <div
                key={formattedDay}
                className="week-planner__row"
                style={{ gridTemplateColumns: `${this.props.segmentSpacing.initialColumnWidthInPixels}px 1fr` }}
            >
                <div className="week-planner__row-first">{formattedDay}</div>
                <ul
                    className="week-planner__row-bars"
                    style={{ gridTemplateColumns: this.props.segmentSpacing.gridTemplateColumns }}
                >
                    {
                        dayRanges.map(dayRange => {
                            const { gridColumn, caps } = Helper.calcGridColumns(dayMoment, dayRange);

                            return (
                                <li
                                    key={gridColumn}
                                    className={Helper.calcCapsClasses(caps.start, caps.end)}
                                    style={{ gridColumn, gridRow: 1, backgroundColor: dayRange.color || this.props.defaultSegmentColor }}
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
                <div
                    className="week-planner__row week-planner__row--hours"
                    style={{ gridTemplateColumns: `${this.props.segmentSpacing.initialColumnWidthInPixels}px ${this.props.segmentSpacing.gridTemplateHeaderColumns}` }}
                >
                    <div className="week-planner__row-first"></div>
                    {_.range(hoursInADay).map(this.renderHours)}
                </div>
                {/* Column separators and vertical markers */}
                <div
                    className="week-planner__row week-planner__row--lines"
                    style={{ gridTemplateColumns: `${this.props.segmentSpacing.initialColumnWidthInPixels}px ${this.props.segmentSpacing.gridTemplateColumns}` }}
                >
                    {/* Day label */}
                    <span />
                    {
                        _.range(segmentsPerDay).map(index => {
                            const hours = Math.floor(index / segmentsPerHour);
                            const mins = (index % segmentsPerHour) * segmentSizeInMinutes;
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
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onKeyDown={this.handleKeyDown}
                    onKeyUp={this.handleKeyUp}
                />
                {/* Rendering the contents of each day */}
                {_.range(daysInAWeek).map(this.renderDayRow)}
            </div>
        );
    }
}
