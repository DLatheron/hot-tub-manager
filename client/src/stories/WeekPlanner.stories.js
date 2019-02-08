import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";
import moment from 'moment';

import WeekPlanner, { Range } from '../components/WeekPlanner';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({
            hoverDateTime: null,
            gridMode: false,
            mode: 'add'
        });

        const hoverTimeHandler = startDateTime => {
            store.set({ hoverDateTime: startDateTime });
        };
        const selectTimeHandler = startDateTime => {
            console.log(`Click at: ${startDateTime.format('ddd HH:mm')}`);
        };

        return (
            <State store={store}>
                {
                    state => (
                        <>
                            <WeekPlanner
                                initialRanges={[
                                    new Range('2017-01-03T00:00:00.000', '2017-01-03T22:30:00.000', 'green' ),
                                    new Range('2017-01-02T00:00:00.000', '2017-01-02T22:15:00.000', 'red' ),
                                    new Range('2017-01-04T00:00:00.000', '2017-01-04T22:45:00.000', 'blue' ),
                                    new Range('2017-01-05T00:00:00.000', '2017-01-05T23:00:00.000', 'yellow' ),
                                    new Range('2017-01-06T02:00:00.000', '2017-01-07T23:00:00.000', 'pink' )
                                ]}
                                markers={{
                                    '20:00': '#2e082e46',
                                    '20:15': '#2e082e46',
                                    '20:30': '#2e082e46',
                                    '20:45': '#2e082e46',
                                    '21:00': '#2e082e46',
                                    '21:15': '#2e082e46',
                                    '21:30': '#2e082e46',
                                    '21:45': '#2e082e46',
                                    '22:00': '#2e082e46',
                                    '22:15': '#2e082e46',
                                    '22:30': '#2e082e46',
                                    '22:45': '#2e082e46'
                                }}
                                selectTimeHandler={selectTimeHandler}
                                hoverTimeHandler={hoverTimeHandler}
                            />
                            {
                                (state.hoverDateTime) && <p>Mouse hovering at: {state.hoverDateTime.format('ddd HH:mm')}</p>
                            }
                        </>
                    )
                }
            </State>
        )
    })
