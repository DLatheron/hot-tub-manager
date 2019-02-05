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

class HeaderRow extends React.PureComponent {
    render() {
        const startMoment = moment.utc(Helper.startDateTime, moment.ISO_8601);

        return (
            <div>
                <StyledDayRow key='header'>
                    <StyledDayHeader key='header'/>
                    {
                        _.range(24).map(
                            hour => {
                                const hourMoment = moment.utc(startMoment).add(hour, 'hours');

                                return (
                                    <StyledTimeHeader key={hourMoment.format('HH')}>{hourMoment.format('HH:mm')}</StyledTimeHeader>
                                );
                            }
                        )
                    }
                </StyledDayRow>
            </div>
        );
    }
}

class DayRow extends React.PureComponent {
    static propTypes = {
        startDateTime: PropTypes.string.isRequired,
        values: PropTypes.object,
        handleClick: PropTypes.func,
        handleMouseMove: PropTypes.func,
        handleMouseLeave: PropTypes.func,
    };

    static defaultProps = {
        handleClick: () => {},
        handleMouseMove: () => {},
        handleMouseLeave: () => {}
    };

    render() {
        const { startDateTime, values, handleClick, handleMouseMove, handleMouseLeave } = this.props;
        const startMoment = moment.utc(startDateTime, moment.ISO_8601);

        return (
            <StyledDayRow>
                {/* <StyledDayLabel
                    key='header'
                    onMouseEnter={handleMouseLeave}>{startMoment.format('ddd')}
                </StyledDayLabel> */}
                <StyledTimeRow
                    colSpan={24}
                    onClick={event => handleClick(event, startMoment)}
                    onMouseMove={event => handleMouseMove(event, startMoment)}>
                    <StyledTimeSpan />
                </StyledTimeRow>
            </StyledDayRow>
        );
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
        Mon: {
            '09:15': 1.0,
            '09:30': 0.75
        }
    };

    handleMouseMove = (event, startMoment) => {
        const hoverMoment = Helper.offsetToTime(
            event.clientX,
            event.target,
            startMoment,
            Helper.minutes
        );

        this.props.hoverTimeHandler(hoverMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event, startMoment) => {
        const clickMoment = Helper.offsetToTime(
            event.clientX,
            event.target,
            startMoment,
            Helper.minutes
        );

        const stateChanges = Helper.setValueAndRange(this.state, clickMoment);
        this.setState(state => {
            console.log(`state: ${JSON.stringify(state, null, 0)}`);
            console.log(`stateChanges: ${JSON.stringify(stateChanges, null, 0)}`);
            return stateChanges
        });

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
    renderHeaderRow(startMoment) {
        return (
            <StyledTableHeader>
                <StyledTableLabel></StyledTableLabel>
                {
                    _.range(24).map(
                        hour => {
                            const hourMoment = moment.utc(startMoment).add(hour, 'hours');

                            return (
                                <StyledTimeLabel key={hourMoment.format('HH')}>{hourMoment.format('HH:mm')}</StyledTimeLabel>
                            );
                        }
                    )
                }
            </StyledTableHeader>
        );
    }

    render() {
        const startMoment = moment.utc(Helper.startDateTime, moment.ISO_8601);

        return (
            <div class="gantt">
                <div class="gantt__row gantt__row--months">
                    <div class="gantt__row-first"></div>
                    {
                        _.range(24).map(hour =>
                            <span key={hour}>
                                {moment.utc(startMoment).add(hour, 'hours').format('HH:mm')}
                            </span>
                        )
                    }
                </div>
                <div class="gantt__row gantt__row--lines" data-month="5">
                    {/* Day label */}
                    <span />
                    {
                        _.range(4 * 24).map(segment => {
                            const marked = segment >= 0 && segment < 4;

                            return <span key={segment} className={marked && 'marker'}/>;
                        })
                    }
                </div>
                <div class="gantt__row">
                    <div class="gantt__row-first">
                        Mon
                    </div>
                    <ul class="gantt__row-bars">
                        <li style={{gridColumn: '18/19', backgroundColor: '#2ecaac'}}>Even longer project</li>
                    </ul>
                </div>
                <div class="gantt__row">
                    <div class="gantt__row-first">
                        Tue
                    </div>
                    <ul class="gantt__row-bars">
                    </ul>
                </div>
            </div>
            // <StyledContainer>
            //     { this.renderHeaderRow(startMoment) }
            //     {/* <StyledDayLabels>
            //         <div>Mon</div>
            //         <div>Tue</div>
            //         <div>Wed</div>
            //         <div>Thu</div>
            //         <div>Fri</div>
            //         <div>Sat</div>
            //         <div>Sun</div>
            //     </StyledDayLabels>
            //     <div onMouseLeave={this.handleMouseLeave} style={{float:'right'}}>
            //         {
            //             _.range(7).map(
            //                 day => {
            //                     const dayMoment = moment.utc(startMoment).add(day, 'days');

            //                     return (
            //                         <DayRow
            //                             key={day}
            //                             values={this.state[dayMoment.format('ddd')]}
            //                             startDateTime={dayMoment.toISOString()}
            //                             handleClick={this.handleClick}
            //                             handleMouseMove={this.handleMouseMove}
            //                             handleMouseLeave={this.handleMouseLeave}
            //                         />
            //                     );
            //                 }
            //             )
            //         }
            //     </div> */}
            // </StyledContainer>
        );
    }
}
