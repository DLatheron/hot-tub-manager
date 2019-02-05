import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import WeekPlanner from '../components/WeekPlanner';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({
            hoverDateTime: null
        });

        const hoverTimeHandler = startDateTime => {
            store.set({ hoverDateTime: startDateTime });
        };
        const selectTimeHandler = startDateTime => {
            console.log(`Called ${startDateTime.format('ddd HH:mm')}`);
        };

        return (
            <State store={store}>
                {
                    state => (
                        <>
                            <WeekPlanner
                                hoverTimeHandler={hoverTimeHandler}
                                selectTimeHandler={selectTimeHandler}
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
