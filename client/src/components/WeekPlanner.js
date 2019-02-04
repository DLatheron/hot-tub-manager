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
    background-color: red;
    vertical-align: middle;
    margin: 0;
    padding: 0;
`;

const StyledDayHeader = Styled.th`
    width: 4%;
    vertical-align: middle;
    border: 1px solid black;
`;

const StyledDayLabel = Styled(StyledDayHeader)`
    text-align: right;
    padding-right: 4px;
`;

const StyledTimeHeader = Styled.th`
    padding: 2px;
    width: 4%;
    font-size: 0.75em;
    text-align: left;
    border: 1px solid black;
`;

const StyledTimeCell = Styled(StyledTimeHeader)`
    position: relative;
    background-color: beige;
    padding: 0px;
`;

const StyledTimeSubCell = Styled.span`
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${props => props.offsetPercentage}%;
    width: 25%;
    opacity: ${props => props.opacity};
    background-color: green;
`;

class Helper {
    // Nicely chosen start time date with January 1st as a Monday.
    static startDateTime = '2018-01-01T00:00:00.000';

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
        const key = `${day}.${hour}.${minute}`;

        return _.get(values, key, 0);
    }

    static setValue(values, startMoment, value = 1.0) {
        const day = startMoment.format('ddd');
        const hour = startMoment.format('HH');
        const minute = startMoment.format('mm');
        const key = `${day}.${hour}.${minute}`;

        value = Math.max(value, _.get(values, key, 0));
        value = Math.max(Math.min(value, 1.0), 0.0);

        _.set(values, key, value);
    }

    static setValueAndRange(values, valueMoment, minutesBefore = 60, minutesAfter = 60) {
        const points = [
            -0.75,
            -0.50,
            -0.25,
            0.0,
            0.25,
            0.50,
            0.75
        ];

        const newValues = { ...values };

        points.forEach(point => {
            let atTime = moment.utc(valueMoment);
            if (point < 0) {
                atTime.add(point * minutesBefore, 'minutes');
            } else if (point > 0) {
                atTime.add(point * minutesAfter, 'minutes');
            }
            const value = 1.0 - Math.abs(point);

            Helper.setValue(newValues, atTime, value);
        });

        return newValues;
    }
}

class TimeCell extends React.PureComponent {
    static propTypes = {
        startDateTime: PropTypes.string.isRequired,
        values: PropTypes.object,
        handleClick: PropTypes.func,
        handleMouseMove: PropTypes.func
    };

    static defaultProps = {
        handleClick: () => {},
        handleMouseMove: () => {}
    };

    render() {
        const { startDateTime, values, handleClick, handleMouseMove } = this.props;
        const startMoment = moment.utc(startDateTime);

        const moments = [
            startMoment,
            moment.utc(startMoment).add(15, 'minutes'),
            moment.utc(startMoment).add(30, 'minutes'),
            moment.utc(startMoment).add(45, 'minutes')
        ];

        return (
            <StyledTimeCell>
                {
                    moments.map(
                        (startMoment, index) => {
                            const offsetPercentage = (index / moments.length) * 100;
                            const opacity = Helper.getValue(values, startMoment);

                            return (
                                <StyledTimeSubCell
                                    key={offsetPercentage}
                                    offsetPercentage={offsetPercentage}
                                    opacity={opacity}
                                    onClick={event => handleClick(event, startMoment)}
                                    onMouseMove={event => handleMouseMove(event, startMoment)}
                                />
                            );
                        }
                    )
                }
            </StyledTimeCell>
        );
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
                                    <StyledTimeHeader key={hourMoment.format('HH')}>{hourMoment.format('HH:mm')}</StyledTimeHeader>
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
        values: PropTypes.object.isRequired,
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
                    _.range(24).map(
                        hour => {
                            const hourMoment = moment.utc(startMoment).add(hour, 'hours');

                            return (
                                <TimeCell
                                    key={hourMoment.format('HH')}
                                    values={values}
                                    startDateTime={hourMoment.toISOString()}
                                    handleClick={handleClick}
                                    handleMouseMove={handleMouseMove}
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
        values: {
            Mon: {
                '08': {
                    '15': 0.25,
                    '30': 0.5,
                    '45': 0.75,
                },
                '09': {
                    '00': 1,
                    '15': 0.75,
                    '30': 0.5,
                    '45': 0.25,
                }
            },
            Wed: {
                '15': {
                    '30': 0.25,
                    '45': 0.50
                },
                '16': {
                    '00': 0.75,
                    '15': 1.0,
                    '30': 0.75,
                    '45': 0.50
                },
                '17': {
                    '00': 0.25
                }
            }
        }
    };

    handleMouseMove = (event, startMoment) => {
        this.props.hoverTimeHandler(startMoment);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event, startMoment) => {
        this.setState(state => ({
            values: Helper.setValueAndRange(state.values, startMoment)
        }));

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
                                        values={this.state.values}
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
