import React from 'react';
import styled from 'styled-components';

import './App.css';
import TemperatureGauge from './components/TemperatureGauge';

const StyledContainer = styled.div`
    margin: 20px;
`;

export default class App extends React.Component {
    render() {
        return (
            <div className="App">
                <StyledContainer>
                    <TemperatureGauge
                        id='TP1'
                        min={0}
                        max={100}
                        value={100}
                        colourGradient={
                            TemperatureGauge.generateGradientBetween(0, 100, [
                                { at:   0, color: '#00f' },
                                { at:  25, color: '#00f' },
                                { at:  25, color: '#0f0' },
                                { at:  50, color: '#0f0' },
                                { at:  50, color: '#f00' },
                                { at:  75, color: '#f00' },
                                { at:  75, color: '#ff0' },
                                { at: 100, color: '#ff0' }
                            ])
                        }
                     />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge id='TP2' min={0} max={100} value={25} />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge id='TP3' min={0} max={100} value={50} />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge id='TP4' min={0} max={100} value={75} />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge id='TP5' min={0} max={100} value={100} />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge
                        id='TP6'
                        min={19.5}
                        max={44}
                        value={44}
                        initialTargetValue={25}
                        units='℃'
                        markings={
                            TemperatureGauge.generateMarkingsBetween(19.5, 44, [
                                { everyX:  0.5, height:  2 },
                                { everyX:  1.0, height:  4 },
                                { everyX:  5.0, height:  7 },
                                { everyX: 10.0, height: 10 }
                            ])
                        }
                        colourGradient={
                            TemperatureGauge.generateGradientBetween(67.5, 111.2, [
                                { at: TemperatureGauge.celsiusToFahrenheit(20), color: '#00f' },
                                { at: TemperatureGauge.celsiusToFahrenheit(34), color: '#00f' },
                                { at: TemperatureGauge.celsiusToFahrenheit(36), color: '#0f0' },
                                { at: TemperatureGauge.celsiusToFahrenheit(39), color: '#0f0' },
                                { at: TemperatureGauge.celsiusToFahrenheit(41), color: '#f00' },
                                { at: TemperatureGauge.celsiusToFahrenheit(44), color: '#f00' }
                            ])
                        }
                    />
                </StyledContainer>
                <StyledContainer>
                    <TemperatureGauge
                        id='TP7'
                        min={67.5}
                        max={111.2}
                        value={111.2}
                        units='℉'
                        markings={
                            TemperatureGauge.generateMarkingsBetween(67.5, 111.2, [
                                { everyX:  0.5, height:  1 },
                                { everyX:  1.0, height:  4 },
                                { everyX:  5.0, height:  7 },
                                { everyX: 10.0, height: 10 }
                            ])
                        }
                        colourGradient={
                            TemperatureGauge.generateGradientBetween(67.5, 111.2, [
                                { at: TemperatureGauge.celsiusToFahrenheit(20), color: '#00f' },
                                { at: TemperatureGauge.celsiusToFahrenheit(35), color: '#00f' },
                                { at: TemperatureGauge.celsiusToFahrenheit(35), color: '#0f0' },
                                { at: TemperatureGauge.celsiusToFahrenheit(40), color: '#0f0' },
                                { at: TemperatureGauge.celsiusToFahrenheit(40), color: '#f00' },
                                { at: TemperatureGauge.celsiusToFahrenheit(44), color: '#f00' }
                            ])
                        }
                    />
                </StyledContainer>
            </div>
        );
    }
}
