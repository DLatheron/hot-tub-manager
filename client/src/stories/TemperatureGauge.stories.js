import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import TemperatureGauge from '../components/TemperatureGauge';

storiesOf('TemperatureGauge', module)
    .add('default', () => {
        const store = new Store({
            value: 50
        });

        return (
            <State store={store}>
                <TemperatureGauge
                    id='defaultTemperatureGauge'
                    setNewTarget={value => store.set({ value: parseFloat(value) })}
                />
            </State>
        );
    })
    .add('graduated', () => {
        const store = new Store({
            value: 100
        });

        return (
            <State store={store}>
                <TemperatureGauge
                    id='graduatedTemperatureGauge'
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
                    setNewTarget={value => store.set({ value: parseFloat(value) })}
                />
                <p>{store.state.value}</p>
            </State>
        );
    })
    .add('celsius', () => {
        const store = new Store({
            min: 19.5,
            max: 44,
            value: 44,
            initialTargetValue: 25,
            units: '℃'
        });

        return (
            <State store={store}>
                <TemperatureGauge
                    id='celsiusTemperatureGauge'
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
                    setNewTarget={value => store.set({ value: parseFloat(value) })}
                />
            </State>
        );
    })
    .add('fahrenheit', () => {
        const store = new Store({
            min: 67.5,
            max: 111.2,
            value: 111.2,
            initialTargetValue: 85,
            units: '℉'
        });

        return (
            <State store={store}>
                <TemperatureGauge
                    id='fahrenheitTemperatureGauge'
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
                    setNewTarget={value => store.set({ value: parseFloat(value) })}
                />
            </State>
        );
    });
