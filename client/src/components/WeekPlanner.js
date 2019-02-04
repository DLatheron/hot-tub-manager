import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Styled from 'styled-components';
import _ from 'lodash';

const StyledContainer = Styled.table`
    width: 100%;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
`;

const StyledDayRow = Styled.tr`
    background-color: beige;
    vertical-align: middle;
    margin: 0;
    padding: 0;
`;

const StyledDayHeader = Styled.th`
    width: 1%;
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

const StyledTimeCell = Styled(StyledTimeHeader)`
    width: 1%;
    background-color: beige;
    padding: 0px;
    opacity: ${props => props.opacity};
    background-color: green;
`;

class Helper {
    // Nicely chosen start time date with January 1st as a Monday.
    static startDateTime = '2018-01-01T00:00:00.000';
    static minutes = 15;

    static offsetToTimeCloseTo(x, element, baseMoment, roundToNearestMinutes) {
        const clientRect = element.getBoundingClientRect();
        const percentage = (x - clientRect.x) / clientRect.width;
        let offsetInMins = percentage * 60;

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
            <thead>
                <StyledDayRow key='header'>
                    <StyledDayHeader key='header'/>
                    {
                        _.range(24).map(
                            hour => {
                                const hourMoment = moment.utc(startMoment).add(hour, 'hours');

                                return (
                                    <StyledTimeHeader key={hourMoment.format('HH')} colSpan={60 / Helper.minutes}>{hourMoment.format('HH:mm')}</StyledTimeHeader>
                                );
                            }
                        )
                    }
                </StyledDayRow>
            </thead>
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
                <StyledDayLabel
                    key='header'
                    onMouseEnter={handleMouseLeave}>{startMoment.format('ddd')}
                </StyledDayLabel>
                {
                    _.range((24 * 60) / Helper.minutes).map(
                        index => {
                            const valueMoment = moment.utc(startMoment).add(index * Helper.minutes, 'minutes');

                            return (
                                <StyledTimeCell
                                    key={index}
                                    onClick={event => handleClick(event, valueMoment)}
                                    onMouseMove={event => handleMouseMove(event, valueMoment)}
                                    opacity={_.get(values, valueMoment.format('HH:mm'), 0)}
                                />
                            );
                        }
                    )
                }
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
        this.props.hoverTimeHandler(startMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event, startMoment) => {
        const stateChanges = Helper.setValueAndRange(this.state, startMoment);
        this.setState(state => {
            console.log(`state: ${JSON.stringify(state, null, 0)}`);
            console.log(`stateChanges: ${JSON.stringify(stateChanges, null, 0)}`);
            return stateChanges
        });

        this.props.selectTimeHandler(startMoment);
    }

    render() {
        const startMoment = moment.utc(Helper.startDateTime, moment.ISO_8601);

        return (
            <StyledContainer>
                <HeaderRow />

                <tbody onMouseLeave={this.handleMouseLeave}>
                    {
                        _.range(7).map(
                            day => {
                                const dayMoment = moment.utc(startMoment).add(day, 'days');

                                return (
                                    <DayRow
                                        key={day}
                                        values={this.state[dayMoment.format('ddd')]}
                                        startDateTime={dayMoment.toISOString()}
                                        handleClick={this.handleClick}
                                        handleMouseMove={this.handleMouseMove}
                                        handleMouseLeave={this.handleMouseLeave}
                                    />
                                );
                            }
                        )
                    }
                </tbody>
            </StyledContainer>
        );
    }
}
