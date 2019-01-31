import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Styled from 'styled-components';

const StyledContainer = Styled.table`
    width: 100%;
    margin: 0;
    padding: 0;
    /* border: 1px solid black; */
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

const times = [
    // '12am',
    // '1am',
    // '2am',
    // '3am',
    // '4am',
    // '5am',
    // '6am',
    // '7am',
    // '8am',
    // '9am',
    // '10am',
    // '11am',
    // '12am',
    // '1pm',
    // '2pm',
    // '3pm',
    // '4pm',
    // '5pm',
    // '6pm',
    // '7pm',
    // '8pm',
    // '9pm',
    // '10pm',
    // '11pm'
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
];

export default class WeekPlanner extends React.Component {
    static propTypes = {
        days: PropTypes.arrayOf(PropTypes.string).isRequired,
        hoverTimeHandler: PropTypes.func,
        selectTimeHandler: PropTypes.func
    };

    static defaultProps = {
        days: [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun'
        ],
        hoverTimeHandler: () => {},
        selectTimeHandler: () => {}
    };

    calculateTime(x, element, baseTime, timeFormat = 'HH:mm') {
        const clientRect = element.getBoundingClientRect();
        const percentage = (x - clientRect.x) / clientRect.width;
        const offsetInMins = percentage * 60;
        const time = moment(baseTime, timeFormat, false).add(offsetInMins, 'minutes').format(timeFormat);

        return time;
    }

    handleMouseMove = (day, baseTime, event) => {
        const time = this.calculateTime(event.clientX, event.target, baseTime, 'HH:mm');

        this.props.hoverTimeHandler(day, time);
    }

    handleMouseLeave = () => {
        this.props.hoverTimeHandler();
    }

    handleClick = (day, baseTime, event) => {
        const time = this.calculateTime(event.clientX, event.target, baseTime, 'HH:mm');

        this.props.selectTimeHandler(day, time);
    }

    render() {
        const { days } = this.props;

        return (
            <StyledContainer>
                <thead>
                    <StyledDayRow key='header'>
                        <StyledDayHeader key='header'/>
                        {
                            times.map(time => <StyledTimeHeader key={time}>{time}</StyledTimeHeader>)
                        }
                    </StyledDayRow>
                </thead>

                <tbody onMouseLeave={this.handleMouseLeave}>
                    {
                        days.map(day => (
                            <StyledDayRow key={day}>
                                <StyledDayLabel
                                    key='header'
                                    onMouseEnter={this.handleMouseLeave}>{day}
                                </StyledDayLabel>
                                {
                                    times.map(
                                        time =>
                                            <StyledTimeLabel
                                                key={time}
                                                onClick={this.handleClick.bind(this, day, time)}
                                                onMouseMove={this.handleMouseMove.bind(this, day, time)}
                                            />
                                    )
                                }
                            </StyledDayRow>
                        ))
                    }
                </tbody>
            </StyledContainer>
        );
    }
}
