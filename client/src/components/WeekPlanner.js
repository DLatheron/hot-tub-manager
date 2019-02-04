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

const StyledTimeLabel = Styled(StyledTimeHeader)`
    background-color: beige;
    padding: 0px;
`;

const startDateTime = '2018-01-01T00:00:00.000';

class TimeCell extends React.PureComponent {
    static propTypes = {
        startDateTime: PropTypes.string.isRequired,
        handleClick: PropTypes.func,
        handleMouseMove: PropTypes.func
    };

    static defaultProps = {
        handleClick: () => {},
        handleMouseMove: () => {}
    };

    render() {
        const { startDateTime, handleClick, handleMouseMove } = this.props;
        const startMoment = moment.utc(startDateTime);

        return (
            <StyledTimeLabel
                onClick={event => handleClick(event, startMoment)}
                onMouseMove={event => handleMouseMove(event, startMoment)}
            />
        );
    }
}

class HeaderRow extends React.PureComponent {
    render() {
        const startMoment = moment.utc(startDateTime, moment.ISO_8601);

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
        const { startDateTime, handleClick, handleMouseMove, handleMouseLeave } = this.props;
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

    calculateTime(x, element, baseMoment) {
        const { roundToNearestMinutes } = this.props;

        const clientRect = element.getBoundingClientRect();
        const percentage = (x - clientRect.x) / clientRect.width;
        let offsetInMins = percentage * 60;

        if (roundToNearestMinutes) {
            offsetInMins = Math.round(offsetInMins / roundToNearestMinutes) * roundToNearestMinutes;
        }

        return moment.utc(baseMoment).add(offsetInMins, 'minutes');
    }

    handleMouseMove = (event, startMoment) => {
        const dateTime = this.calculateTime(event.clientX, event.target, startMoment);

        this.props.hoverTimeHandler(dateTime);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (event, startMoment) => {
        const dateTime = this.calculateTime(event.clientX, event.target, startMoment);

        this.props.selectTimeHandler(dateTime);
    }

    render() {
        const startMoment = moment.utc(startDateTime, moment.ISO_8601);

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
