import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import ControlPane from '../components/ControlPane';
import '../components/ControlPane.scss';

import TemperatureGauge from '../components/TemperatureGauge';
import WeekPlanner from '../components/WeekPlanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'

storiesOf('ControlPane', module)
    .add('default', () => {
        const store = new Store({
            temperature: 76.5
        });

        return (
            <State store={store}>
                {
                    state => (
                        <ControlPane
                            {...state}
                            controls={[
                                {
                                    type: 'title',
                                    control:
                                        <div>
                                            <h1>Control Pane</h1>
                                            <button
                                                style={{
                                                    float: 'right',
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: 'transparent',
                                                    fontSize: 26,
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle} />
                                            </button>
                                        </div>
                                },
                                {
                                    type: 'control',
                                    label: 'Control One:',
                                    control:
                                        <input
                                            type='text'
                                            style={{
                                                width: '100%',
                                                padding: 5,
                                                margin: 0,
                                                border: 'none',
                                                outline: 'none',
                                                lineHeight: '1em',
                                                overflow: 'hidden'
                                            }}
                                            placeholder='Type name here...'
                                        />
                                },
                                {
                                    type: 'Control',
                                    label: 'Control Two:',
                                    control:
                                        <label
                                            style={{
                                                width: '100%',
                                                margin: 'auto',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <input
                                                type='checkbox'
                                                style={{
                                                    margin: 6
                                                }}
                                            />
                                            Turn it on
                                        </label>
                                },
                                {
                                    label: 'Control Three:',
                                    control:
                                        <select
                                            style={{
                                                width: '100%',
                                                margin: 0,
                                                padding: 0,
                                                marginBottom: 2
                                            }}
                                        >
                                            <option value='1'>Value 1</option>
                                            <option value='2'>Value 2</option>
                                            <option value='3'>Value 3</option>
                                            <option value='4'>Value 4</option>
                                            <option value='5'>Value 5</option>
                                            <option value='6'>Value 6</option>
                                        </select>
                                },
                                {
                                    label: 'Temperature:',
                                    control:
                                        <TemperatureGauge
                                            id='temperature'
                                            style={{
                                                width: '100%',
                                                overflow: 'hidden'
                                            }}
                                            value={store.get('temperature')}
                                            setNewTarget={value => store.set({ temperature: parseFloat(value) })}
                                        />
                                },
                                {
                                    type: 'separator',
                                    control: <div style={{ height: 50 }} />
                                },
                                {
                                    type: 'section',
                                    control: [
                                        {
                                            type: 'title',
                                            control:
                                                <h2>Embedded Control</h2>
                                        },
                                        {
                                            type: 'Control',
                                            label: 'Control Five:',
                                            control:
                                                <label
                                                    style={{
                                                        width: '100%',
                                                        margin: 'auto',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <input
                                                        type='checkbox'
                                                        style={{
                                                            margin: 6
                                                        }}
                                                    />
                                                    Turn it on
                                                </label>
                                        },
                                        {
                                            type: 'separator',
                                            control: <div style={{ height: 10 }} />
                                        },
                                        {
                                            type: 'title',
                                            control:
                                                <h3>Weekly Planner</h3>
                                        },
                                        {
                                            type: 'WideControl',
                                            label: 'Control Five:',
                                            control:
                                                <div
                                                    style={{
                                                        fontSize: '10px',
                                                        width: '100%',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <WeekPlanner />
                                                </div>
                                        }
                                    ]
                                }
                            ]}
                        />
                    )
                }
            </State>
        )
    })
