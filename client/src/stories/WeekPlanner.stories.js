import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";
import _ from 'lodash';

import WeekPlanner, { Range, Helper } from '../components/WeekPlanner';
import '../components/WeekPlanner.scss';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({
            hoverDateTime: null,
            gridMode: false,
            mode: 'add',
            ranges: [
                new Range('2018-01-02T01:00:00.000', '2018-01-02T22:15:00.000', 'red' ),
                new Range('2018-01-03T02:00:00.000', '2018-01-03T22:30:00.000', 'green' ),
                new Range('2018-01-04T03:00:00.000', '2018-01-04T22:45:00.000', 'blue' ),
                new Range('2018-01-05T04:00:00.000', '2018-01-05T23:00:00.000', 'yellow' ),
                new Range('2018-01-06T20:00:00.000', '2018-01-07T23:00:00.000', 'pink' )
            ]
        });

        const hoverTimeHandler = startDateTime => {
            store.set({ hoverDateTime: startDateTime });
        };
        const rangesChangedHandler = updatedRanges => {
            store.set({ ranges: updatedRanges });
        };

        return (
            <State store={store}>
                {
                    state => (
                        <>
                            <WeekPlanner
                                ranges={state.ranges}
                                segmentSpacing={Helper.calcSegmentSpacing(80, [
                                    ..._.times(80, _.constant(1)),
                                    ..._.times(12, _.constant(2)),
                                    ..._.times( 4, _.constant(1))
                                ])}
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
                                hoverTimeHandler={hoverTimeHandler}
                                rangesChangedHandler={rangesChangedHandler}
                            />
                            <button type='button' onClick={event => store.set({ ranges: [] })}>None</button>
                            <button type='button' onClick={event => store.set({ ranges: [
                                new Range('2018-01-01T20:00:00.000', '2018-01-01T23:00:00.000', 'green' ),
                                new Range('2018-01-02T20:00:00.000', '2018-01-02T23:00:00.000', 'green' ),
                                new Range('2018-01-03T20:00:00.000', '2018-01-03T23:00:00.000', 'green' ),
                                new Range('2018-01-04T20:00:00.000', '2018-01-04T23:00:00.000', 'green' ),
                                new Range('2018-01-05T20:00:00.000', '2018-01-05T23:00:00.000', 'green' ),
                                new Range('2018-01-06T20:00:00.000', '2018-01-06T23:00:00.000', 'green' ),
                                new Range('2018-01-07T20:00:00.000', '2018-01-07T23:00:00.000', 'green' ),
                            ] })}>Primetime</button>
                            <button type='button' onClick={event => store.set({ ranges: [
                                new Range('2018-01-01T00:00:00.000', '2018-01-02T00:00:00.000', 'green' ),
                                new Range('2018-01-02T00:00:00.000', '2018-01-03T00:00:00.000', 'green' ),
                                new Range('2018-01-03T00:00:00.000', '2018-01-04T00:00:00.000', 'green' ),
                                new Range('2018-01-04T00:00:00.000', '2018-01-05T00:00:00.000', 'green' ),
                                new Range('2018-01-05T00:00:00.000', '2018-01-06T00:00:00.000', 'green' ),
                                new Range('2018-01-06T00:00:00.000', '2018-01-07T00:00:00.000', 'green' ),
                                new Range('2018-01-07T00:00:00.000', '2018-01-08T00:00:00.000', 'green' ),
                            ] })}>All</button>
                            { (state.hoverDateTime) && <p>Mouse hovering at: {state.hoverDateTime.format('ddd HH:mm')}</p> }
                        </>
                    )
                }
            </State>
        )
    })
