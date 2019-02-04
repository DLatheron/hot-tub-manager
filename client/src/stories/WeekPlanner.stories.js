import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import WeekPlanner from '../components/WeekPlanner';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({
            hoverDateTime: null
        });

        return (
            <State store={store}>
                {
                    state => (
                        <>
                            <WeekPlanner
                                roundToNearestMinutes={15}
                                hoverTimeHandler={startDateTime => {
                                    store.set({ hoverDateTime: startDateTime });
                                }}
                                selectTimeHandler={(startDateTime) => {
                                    console.log(`Called ${startDateTime}`);
                                }}
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
