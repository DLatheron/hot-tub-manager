import React from 'react';
import PropTypes from 'prop-types';
import Styled from 'styled-components';
import ReactTooltip from 'react-tooltip';

const StyledContainer = Styled.div`
    display: block;
    width: auto;
    position: relative;
    text-align: left;
`;

const StyledGraphicContainer = Styled.div`
    display: inline-block;
    width: calc(400px + 40px);
    height: 20px;
    vertical-align: middle;
    position: relative;
    background-color: beige;
    overflow: hidden;
    border-radius: 10px;
    border-width: 0.5px;
    border-style: solid;
    border-color: black;
`;

const StyledBulb = Styled.div`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 400px;
    background-color: silver;
`;

const StyledBulbFill = Styled.div`
    position: absolute;
    left: 0;
    right: 400px;
    top: 0;
    bottom: 0;
    background-image: linear-gradient(red, darkred);
`;

const StyledTube = Styled.div`
    position: absolute;
    left: 40px;
    right: 0;
    top: 0;
    bottom: 0;
    cursor: pointer;
    background-image: ${props => props.colourGradient};
`;

const StyledTubeFill = Styled.span.attrs({
})`
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(${props => props.percentage}% + 1px);
    right: 0;
    background-color: beige;
`;

const StyledHighlight = Styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-image: linear-gradient(
        rgba(255, 255, 255, .9),
        rgba(255, 255, 255, 0) 50%,
        rgba(0, 0, 0, .4) 100%
    );
`;

const StyledMeasurement = Styled.span`
    position: absolute;
    left: ${props => props.offset}%;
    min-width: 1px;
    max-width: 1px;
    top: ${props => -props.height / 2}px;
    bottom: calc(20px - ${props => props.height}px);
    background-color: black;
`;

const StyledNumerics = Styled.span`
    font-size: 16px;
    vertical-align: middle;
    margin-left: 10px;
`;

const StyledNumericValue = Styled.span`
`;

const StyledNumericTarget = Styled.span`
    border-radius: 10px;
    border: 1px solid black;
    margin-left: 10px;
    padding-left: 10px;
    padding-right: 10px;

    &:focus-within {
        box-shadow: 0 0 2pt 1pt blue;
    }
`;

const StyledInput = Styled.input`
    display: inline-block;
    width: 40px;
    height: 16px;
    border: none;
    text-align: right;
    font-size: 16px;
    outline: none;
`;

const StyledValue = Styled.span`
`;

const StyledUnits = Styled.span`
`;

const StyledTarget = Styled.span`
    margin: auto;
    font-size: 12px;
    font-family: 'Material Icons';
`;

const StyledTooltip = Styled(ReactTooltip)`
    opacity: 1 !important;
    min-width: 50px;
    text-align: center;
`;

export default class TemperatureGauge extends React.PureComponent {
    inputRef = React.createRef();
    tubeRef = React.createRef();

    static propTypes = {
        id: PropTypes.string.isRequired,
        min: PropTypes.number,
        max: PropTypes.number,
        value: PropTypes.number,
        initialTargetValue: PropTypes.number,
        decimalPlaces: PropTypes.number,
        nearest: PropTypes.number,
        units: PropTypes.string,
        markings: PropTypes.arrayOf(PropTypes.shape({
            percentage: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired
        })),
        colourGradient: PropTypes.string,
        updateTarget: PropTypes.func,
        setNewTarget: PropTypes.func
    };

    static defaultProps = {
        id: undefined,
        min:   0,
        max: 100,
        value: 0,
        initialTargetValue: 0,
        decimalPlaces: 1,
        nearest: 0.5,
        units: '%',
        markings: TemperatureGauge.generateMarkingsBetween(0, 100, [
            { everyX:  5, height: 2 },
            { everyX: 10, height: 5 },
            { everyX: 50, height: 10 }
        ]),
        colourGradient: TemperatureGauge.generateGradientBetween(0, 100, [
            { at:   0, color: 'red' },
            { at: 100, color: 'red' }
        ]),
        updateTarget: () => {},
        setNewTarget: () => {}
    }

    static state = {
        targetValue: 0,
        hoverValue: null
    }

    static celsiusToFahrenheit(celsius) {
        return (celsius * 1.8) + 32;
    }

    static fahrenheitToCelsius(farenheit) {
        return (farenheit - 32) / 1.8;
    }

    static _generateMarkingsBetween(min, max, everyX, markingHeight) {
        function roundDown(value) {
            return Math.floor((value - 1) / everyX) * everyX;
        }
        function roundUp(value) {
            return Math.ceil((value + 1) / everyX) * everyX;
        }

        const start = roundDown(min);
        const end = roundUp(max);
        const count = Math.floor((end - start) / everyX);
        const markings = {};

        for (let i = 0; i < count; ++i) {
            const value = start + (i * everyX);
            if (value >= min && value <= max) {
                markings[value] = markingHeight;
            }
        }

        return markings;
    }

    static timeToPercentageFactory(min, max) {
        const range = max - min;
        if (range > 0) {
            return (value) => {
                const offset = ((value - min) / range) * 100;

                return (
                    Math.max(
                        Math.min(offset, 100),
                        0
                    )
                );
            };
        }
    }

    static generateMarkingsBetween(min, max, markings) {
        const offsetToPercentage = TemperatureGauge.timeToPercentageFactory(min, max);
        if (!offsetToPercentage) {
            return [];
        }

        let result = {};

        markings.forEach(({ everyX, height }) => {
            result = Object.assign(
                result,
                TemperatureGauge._generateMarkingsBetween(min, max, everyX, height)
            );
        });

        const resultArray = Object.entries(result).map(([offset, height]) => {
            const percentage = offsetToPercentage(parseFloat(offset));

            return { percentage, height };
        });

        return resultArray;
    }

    static generateGradientBetween(min, max, stops) {
        const offsetToPercentage = TemperatureGauge.timeToPercentageFactory(min, max);
        if (!offsetToPercentage) {
            return [];
        }

        let results = [];

        stops.forEach(({ at, color }) => {
            const percentage = offsetToPercentage(at);

            results.push(`${color} ${percentage}%`);
        });

        const gradient = `linear-gradient(to right, ${results.join(',')})`;

        console.log(gradient);

        return gradient;
    }

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            targetValue: props.initialTargetValue || props.value
        };
    }

    renderMarking(measurement) {
        return (
            <StyledMeasurement
                key={measurement.percentage}
                offset={measurement.percentage}
                height={measurement.height}
            />
        )
    }

    targetValueChanged(targetValue, confirmed = false) {
        this.setState({ targetValue });

        const { min, max } = this.props;

        // TODO: Perform range validation...
        if (targetValue < min || targetValue > max) {
            console.log(`Invalid target value: ${targetValue}`);
            return;
        }

        if (!confirmed) {
            this.props.updateTarget(targetValue);
            console.log(`Target value updated to: ${targetValue}`);
        } else {
            this.props.setNewTarget(targetValue);
            console.log(`Target value set to: ${targetValue}`);
        }
    }

    static nearest(value, nearest) {
        return Math.round(value / nearest) * nearest;
    }

    calculateValueFromXOffset = (control, clientX) => {
        const { min, max, decimalPlaces, nearest } = this.props;

        const clientRect = control.getBoundingClientRect();
        const fraction = (clientX - clientRect.x - 1) / clientRect.width;
        const value = TemperatureGauge.nearest(min + (fraction * (max - min)), nearest);

        return Math.min(Math.max(value, min), max).toFixed(decimalPlaces);
    };

    handleValueChange = (event) => {
        const targetValue = event.target.value;

        this.targetValueChanged(targetValue);
    }

    handleKeyPress = (event) => {
        const targetValue = event.target.value;

        if (event.key === 'Enter') {
            event.target.blur();
            event.stopPropagation();
            this.targetValueChanged(targetValue, true);
        } else if (event.key === 'Tab') {
            this.targetValueChanged(targetValue, true)
        }
    }

    handleTargetClick = () => {
        this.inputRef.current.focus();
    }

    handleTubeClick = (event) => {
        const targetValue = this.calculateValueFromXOffset(this.tubeRef.current, event.clientX);

        this.targetValueChanged(targetValue, true);
    }

    handleTubeHover = (event) => {
        const hoverValue = this.calculateValueFromXOffset(this.tubeRef.current, event.clientX);

        this.setState({ hoverValue });
    }

    handleTubeHoverEnd = (event) => {
        this.setState({ hoverValue: null });
    }

    render() {
        const { id, min, max, value, units, markings, colourGradient } = this.props;
        const { targetValue, hoverValue } = this.state;
        const initialOffset = 50;
        const percentage = TemperatureGauge.timeToPercentageFactory(min, max)(value);
        const formattedHoverValue = hoverValue && `${hoverValue}${units}`;

        return (
            <StyledContainer>
                <StyledGraphicContainer>
                    <StyledBulb>
                        <StyledBulbFill />
                    </StyledBulb>
                    <StyledTube
                        colourGradient={colourGradient}
                    >
                        <StyledTubeFill
                            initialOffset={initialOffset}
                            percentage={percentage}
                        />
                    </StyledTube>
                    <StyledHighlight />
                    <StyledTube
                        ref={this.tubeRef}
                        onClick={this.handleTubeClick}
                        onMouseMove={this.handleTubeHover}
                        onMouseLeave={this.handleTubeHoverEnd}
                        data-tip
                        data-for={`${id}_hoverTime`}
                        data-offset='{ "top": 10, "right": 1 }'
                    >
                        { markings.map(this.renderMarking) }
                    </StyledTube>
                    <StyledTooltip
                        id={`${id}_hoverTime`}
                        type='light'
                        place='top'
                        effect='solid'
                        border={true}
                    >
                        <span>{formattedHoverValue}</span>
                    </StyledTooltip>
                </StyledGraphicContainer>
                <StyledNumerics>
                    <StyledNumericValue>
                        <StyledValue>{value}</StyledValue>
                        <StyledUnits>{units}</StyledUnits>
                    </StyledNumericValue>
                    <StyledNumericTarget onClick={this.handleTargetClick}>
                        <StyledTarget>my_location</StyledTarget>
                        <StyledInput
                            ref={this.inputRef}
                            type='text'
                            value={targetValue}
                            onChange={this.handleValueChange}
                            onKeyPress={this.handleKeyPress}
                        />
                        <StyledUnits>{units}</StyledUnits>
                    </StyledNumericTarget>
                </StyledNumerics>
            </StyledContainer>
        );
    }
}
