import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './WeekPlanner.scss';

const baseMoment = moment.utc('2017-01-01T00:00:00.000', moment.ISO_8601);

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
            // { start: moment.utc('2017-01-02T00:00:00.000'), end: moment.utc('2017-01-02T00:15:00.000'), color: 'red' },
            // { start: moment.utc('2017-01-03T00:00:00.000'), end: moment.utc('2017-01-03T00:30:00.000'), color: 'green' },
            // { start: moment.utc('2017-01-04T00:00:00.000'), end: moment.utc('2017-01-04T00:45:00.000'), color: 'blue' },
            // { start: moment.utc('2017-01-05T00:00:00.000'), end: moment.utc('2017-01-05T01:00:00.000'), color: 'yellow' },
            // { start: moment.utc('2017-01-06T23:00:00.000'), end: moment.utc('2017-01-07T01:00:00.000'), color: 'pink' },
            { start: moment.utc('2017-01-04T09:00:00.000'), end: moment.utc('2017-01-04T10:00:00.000'), color: 'pink' },
            // { day: 'Thu', start: '15:00', end: '16:00', color: 'blue' },
            // { day: 'Fri', start: '01:15', end: '02:45', color: 'green' },
            // { day: 'Sun', start: '00:00', end: '23:59', color: 'green' }
        ]
    };

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
            .day(day)
            .minutes(mins);
    }

    handleMouseDown = (event) => {
        // TODO: Only left button down!

        const dragStart = WeekPlanner.calcTimeAt(event.clientX, event.clientY);

        this.setState({
            dragging: true,
            dragStart,
            dragEnd: null
        });
    }

    handleMouseUp = (event) => {
        // TODO: Only left button down!

        const dragStart = this.state.dragStart;
        const dragEnd = WeekPlanner.calcTimeAt(event.clientX, event.clientY);

        console.log(`Drag start: ${dragStart.format('ddd HH:mm')} to ${dragEnd.format('ddd HH:mm')}`)

        this.setState({
            dragging: false
        });
    }

    handleMouseMove = (event) => {
        const hoverMoment = WeekPlanner.calcTimeAt(event.clientX, event.clientY);

        if (this.state.dragging) {
            this.setState({
                dragEnd: hoverMoment
            });
        }

        this.props.hoverTimeHandler(hoverMoment);
    }

    handleMouseLeave = () => {
        // this.setState({
        //     dragging: false
        // });

        this.props.hoverTimeHandler();
    }

    handleClick = (event) => {
        const clickMoment = WeekPlanner.calcTimeAt(event.clientX, event.clientY);

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

    static calcGridColumn(baseMoment, timeMoment) {
        const timeOffsetInMinutes = timeMoment.diff(baseMoment, 'minutes');
        const column = Math.round(timeOffsetInMinutes / 15 + 1);

        return column;
    }

    static calcGridColumns(baseMoment, startMoment, endMoment) {
        const minColumn = 1;
        const maxColumn = 96 + 1;

        const startColumn = WeekPlanner.calcGridColumn(baseMoment, startMoment);
        const endColumn = WeekPlanner.calcGridColumn(baseMoment, endMoment);


        return {
            caps: {
                start: startColumn >= minColumn,
                end: endColumn <= maxColumn
            },
            gridColumn: `${Math.max(startColumn, minColumn)}/${ Math.min(endColumn, maxColumn)}`,
        };
    }

    static dateRangesOverlap(range0, range1) {
        return range0.start.isSameOrBefore(range1.end) && range0.end.isSameOrAfter(range1.start);
    }

    static clipDateRange(toClip, range) {
        return {
            clippedStartTime: toClip.start.isSameOrAfter(range.start) ? toClip.start : range.start,
            clippedEndTime: toClip.end.isSameOrBefore(range.end) ? toClip.end : range.end
        };
    }

    getDragStart() {
        return (
            this.state.dragStart.isSameOrBefore(this.state.dragEnd)
                ? this.state.dragStart
                : this.state.dragEnd
        );
    }

    getDragEnd() {
        return moment.utc(
            this.state.dragStart.isSameOrBefore(this.state.dragEnd)
                ? this.state.dragEnd
                : this.state.dragStart
        ).add(15, 'minutes');
    }

    hasDragStarted() {
        return this.state.dragStart && this.state.dragEnd;
    }

    render() {
        const startMoment = moment.utc(baseMoment);

        return (
            <div className="week-planner">
                <div className="week-planner__row week-planner__row--hours">
                    <div className="week-planner__row-first"></div>
                    {
                        _.range(24).map(hour =>
                            <span key={hour}>
                                {moment.utc(startMoment).add(hour, 'hours').format('HH:mm')}
                            </span>
                        )
                    }
                </div>
                <div className="week-planner__row week-planner__row--lines">
                    {/* Day label */}
                    <span />
                    {
                        _.range(4 * 24).map(index => {
                            const marked = index >= 0 && index < 4;

                            return <span key={index} className={marked ? 'marker' : ''} />;
                        })
                    }
                </div>
                <div
                    className="week-planner__row--selection"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                />
                {
                    _.range(7).map(index => {
                        const dayMoment = moment.utc(startMoment).add(index, 'days');
                        const endOfDayMoment = moment.utc(dayMoment).endOf('day');
                        const dayTimes = this.state.times.filter(entry => WeekPlanner.dateRangesOverlap(
                            entry,
                            { start: dayMoment, end: endOfDayMoment }
                        ));
                        // console.log(`dayTimes: ${JSON.stringify(dayTimes, null, 4)}`);

                        const day = dayMoment.format('ddd');
                        let selection = null;

                        if (this.hasDragStarted()) {
                            const dragStart = this.getDragStart();
                            const dragEnd = this.getDragEnd();
                            // const dayIndex = dayMoment.day();

                            if (WeekPlanner.dateRangesOverlap(
                                { start: dragStart, end: dragEnd },
                                { start: dayMoment, end: endOfDayMoment }
                            )) {
                                const { clippedStartTime: dragStartTime, clippedEndTime: dragEndTime } =
                                    WeekPlanner.clipDateRange(
                                        { start: dragStart, end: dragEnd },
                                        { start: dayMoment, end: endOfDayMoment }
                                    );

                                const { gridColumn } = WeekPlanner.calcGridColumns(dayMoment, dragStartTime, dragEndTime);

                                console.log(`dragStartTime: ${dragStartTime}, dragEndTime: ${dragEndTime}`);
                                console.log(`gridColumn: ${JSON.stringify(gridColumn, null, 4)}`);

                                selection = <li className='selection startCap endCap' style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}}>+</li>
                            }
                        }

                        return (
                            <div className="week-planner__row">
                                <div className="week-planner__row-first">
                                    {day}
                                </div>
                                <ul className="week-planner__row-bars">
                                    {
                                        dayTimes.map(dayTime => {
                                            const { gridColumn, caps } = WeekPlanner.calcGridColumns(dayMoment, dayTime.start, dayTime.end);
                                            const capsClasses = `${caps.start ? 'startCap' : ''} ${caps.end ? 'endCap' : ''}`;
                                            console.log(`gridColumn: ${JSON.stringify(gridColumn, null, 4)}`);

                                            return (
                                                <li className={capsClasses} style={{gridColumn, gridRow: 1, backgroundColor: dayTime.color || '#2ecaac'}} />
                                            );
                                        })
                                    }
                                    { selection }
                                </ul>
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}
