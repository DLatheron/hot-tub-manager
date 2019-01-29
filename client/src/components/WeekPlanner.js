import React from 'react';
import PropTypes from 'prop-types';
import Styled from 'styled-components';

const StyledContainer = Styled.div`
    display: block;
    margin: 0;
    padding: 0;
`;

const StyledDayRow = Styled.div`
    display: block;
    background-color: red;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    height: 25px;
`;

const StyledTimesContainer = Styled.span`
    display: inline-block;
    background-color: blue;
    border-width: 1px 0 0 0;
    border-color: black;
    border-style: solid dashed solid dashed;
`;

const StyledDayLabel = Styled.span`
    display: inline-block;
    width: 50px;
    vertical-align: top;
`;

const StyledEntry = Styled.span`
    display: inline-block;
    width: 40px;
    height: 25px;
    background-color: beige;
    border-width: 0 0 0 1px;
    border-color: black;
    border-style: none dashed none dashed;
    padding: 2px;
    /* padding: 4px; */
    font-size: 0.75em;
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
    '00:00 - ',
    '01:00 - ',
    '02:00 - ',
    '03:00 - ',
    '04:00 - ',
    '05:00 - ',
    '06:00 - ',
    '07:00 - ',
    '08:00 - ',
    '09:00 - ',
    '10:00 - ',
    '11:00 - ',
    '12:00 - ',
    '13:00 - ',
    '14:00 - ',
    '15:00 - ',
    '16:00 - ',
    '17:00 - ',
    '18:00 - ',
    '19:00 - ',
    '20:00 - ',
    '21:00 - ',
    '22:00 - ',
    '23:00 - '
];

export default class WeekPlanner extends React.Component {
    static propTypes = {
        days: PropTypes.arrayOf(PropTypes.string)
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
        ]
    };

    renderDayRow(day) {
        return (
            <StyledDayRow>
                <StyledDayLabel>{day}</StyledDayLabel>
                <StyledTimesContainer>
                    {
                        times.map(time => <StyledEntry />)
                    }
                </StyledTimesContainer>
            </StyledDayRow>
        );
    };

    render() {
        const { days } = this.props;

        return (
            <StyledContainer>
                <StyledDayRow>
                    <StyledDayLabel />
                    <StyledTimesContainer>
                        {
                            times.map(time => <StyledEntry>{time}</StyledEntry>)
                        }
                    </StyledTimesContainer>
                </StyledDayRow>
                {days.map(day => this.renderDayRow(day))}
            </StyledContainer>
        );
    }
}
