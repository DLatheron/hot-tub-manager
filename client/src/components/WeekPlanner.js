import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Styled from 'styled-components';
import _ from 'lodash';

import './WeekPlanner.scss';

const StyledContainer = Styled.div`
    width: 100%;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
    box-sizing: border-box;
    display: grid;
    position: relative;
    border: 0;
    border-radius: 12px;
    overflow: hidden;
`;

const StyledTableHeader = Styled.div`
    color: #fff;
    background-color: #0a3444;
    grid-template-columns: 150px repeat(24, 1fr);
`

const StyledTableLabel = Styled.div`
    padding: 20px 2px 20px 2px;
`;

const StyledTimeLabel = Styled.span`
    color: #fff;
    background-color: #0a3444;
    padding: 2px;
    font-size: 0.75em;
    text-align: left;
`;




const StyledDayRow = Styled.div`
    display: block;
    background-color: beige;
    vertical-align: middle;
    margin: 0;
    padding: 0;
`;

const StyledDayLabels = Styled.div`
    float: left;
    background: pink;
    width: 50px;
    text-align: right;
`

const StyledDayHeader = Styled.span`
    display: inline-block;
    width: 4%;
    vertical-align: middle;
    border: 1px solid black;
    background-color: red;
`;

const StyledDayLabel = Styled(StyledDayHeader)`
    text-align: right;
    padding-right: 4px;
    background-color: red;
`;

const StyledTimeHeader = Styled.th`
    padding: 2px;
    width: 4%;
    font-size: 0.75em;
    text-align: left;
    background-color: red;
    border: 1px solid black;
`;

const StyledTimeRow = Styled(StyledTimeHeader)`
    position: relative;
    width: 100%;
    background-color: beige;
    padding: 0px;
    /* opacity: ${props => props.opacity}; */
    background-color: beige;
`;

const StyledTimeSpan = Styled.span`
    position: absolute;
    left: calc(4% + 4%);
    right: calc(4% + 4%);
    top: 0;
    bottom: 0;
    background: green;
`;

class Helper {
    // Nicely chosen start time date with January 1st as a Monday.
    static startDateTime = '2018-01-01T00:00:00.000';
    static minutes = 15;

    static offsetToTime(x, element, baseMoment, roundToNearestMinutes) {
        const clientRect = element.getBoundingClientRect();
        const percentage = (x - clientRect.x) / clientRect.width;
        let offsetInMins = percentage * 24 * 60;

        if (roundToNearestMinutes) {
            offsetInMins = Math.round(offsetInMins / roundToNearestMinutes) * roundToNearestMinutes;
        }

        return moment.utc(baseMoment).add(offsetInMins, 'minutes');
    }

    static getValue(values, startMoment) {
        const day = startMoment.format('ddd');
        const hour = startMoment.format('HH');
        const minute = startMoment.format('mm');
        const key = `${day}_${hour}_${minute}`;

        return _.get(values, key, 0);
    }

    static setValue(existingValues, startMoment, value = 1.0) {
        const day = startMoment.format('ddd');
        const hour = startMoment.format('HH');
        const minute = startMoment.format('mm');
        const key = `${day}_${hour}_${minute}'`;

        value = Math.max(value, _.get(existingValues, key, 0));
        value = Math.max(Math.min(value, 1.0), 0.0);

        return { [key]: value };
    }

    static setValueAndRange(existingValues, valueMoment, minutesBefore = 60, minutesAfter = 60) {
        const points = [];

        for (let i = -minutesBefore; i <= minutesAfter; i += Helper.minutes) {
            let value = (i / minutesBefore);
            points.push(value);
        }

        let newValues = {};

        points.forEach(point => {
            let atTime = moment.utc(valueMoment);
            if (point < 0) {
                atTime.add(point * minutesBefore, 'minutes');
            } else if (point > 0) {
                atTime.add(point * minutesAfter, 'minutes');
            }
            const value = 1.0 - Math.abs(point);
            if (value > 0) {
                const day = atTime.format('ddd');
                const key = atTime.format('HH:mm');

                if (!newValues[day]) {
                    newValues[day] = { ...existingValues[day] || {} };
                }

                const existingValue = newValues[day][key] || 0;

                newValues[day][key] = Math.max(value, existingValue);
            }
        });

        console.log(`newValues: ${JSON.stringify(newValues, null, 4)}`);

        return newValues;
    }
}

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
            { day: 'Mon', start: '09:00', end: '10:00', color: 'red' },
            { day: 'Thu', start: '15:00', end: '16:00', color: 'blue' },
            { day: 'Fri', start: '01:15', end: '02:45', color: 'green' },
            { day: 'Sun', start: '00:00', end: '23:59', color: 'green' }
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

        const row = Math.floor(y / constants.rowHeight);
        const col = Math.floor((x / (constants.columnWidth / 4)) + .5);

        const day = row + 1;
        const mins = Math.round(col * 15);

        return moment
            .utc(Helper.startDateTime, moment.ISO_8601)
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

        if (Math.abs(dragStart.diff(dragEnd, 'minutes')) >= 15) {
            console.log('Some sort of valid drag happened...');
        } else {
            console.log('Invalid drag - too short');
        }

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

    static calcGridColumn(timeAsString) {
        const timeMoment = moment.utc(timeAsString, 'HH:mm');
        const timeOffsetInMinutes = timeMoment.hour() * 60 + timeMoment.minute();
        const column = Math.round(timeOffsetInMinutes / 15 + 1);

        return column;
    }

    static calcGridColumns(startTimeAsString, endTimeAsString) {
        const startColumn = WeekPlanner.calcGridColumn(startTimeAsString);
        const endColumn = WeekPlanner.calcGridColumn(endTimeAsString);

        return `${startColumn}/${endColumn}`;
    }

    render() {
        const startMoment = moment.utc(Helper.startDateTime, moment.ISO_8601);

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
                        const day = dayMoment.format('ddd');
                        const dayTimes = this.state.times.filter(entry => entry.day === day);
                        let selection = null;

                        if (this.state.dragStart && this.state.dragEnd) {
                            const dragStartDay = Math.min(this.state.dragStart.day(), this.state.dragEnd.day());
                            const dragEndDay = Math.max(this.state.dragStart.day(), this.state.dragEnd.day());

                            console.log(`dragStartDay: ${dragStartDay}, dragEndDay: ${dragEndDay}`);

                            if (index + 1 >= dragStartDay && index + 1 <= dragEndDay) {
                                const dragStartTime = this.state.dragStart.format('HH:mm');
                                const dragEndTime = this.state.dragEnd.format('HH:mm');
                                const gridColumn = WeekPlanner.calcGridColumns(dragStartTime, dragEndTime);

                                selection = <li className='selection' style={{gridColumn, gridRow: 1, backgroundColor: '#2ecaac'}} />
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
                                            const gridColumn = WeekPlanner.calcGridColumns(dayTime.start, dayTime.end);

                                            return (
                                                <li style={{gridColumn, gridRow: 1, backgroundColor: dayTime.color || '#2ecaac'}} />
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
