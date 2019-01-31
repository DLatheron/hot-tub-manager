import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import WeekPlanner from '../components/WeekPlanner';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({
            hoverDay: null,
            hoverTime: null
        });

        return (
            <State store={store}>
                {
                    state => (
                        <>
                            <WeekPlanner
                                hoverTimeHandler={(day, time) => {
                                    store.set({ hoverDay: day, hoverTime: time });
                                    console.log(`hover: ${store.state.hoverDay} at ${store.state.hoverTime}`)
                                }}
                                selectTimeHandler={(day, time) => {
                                    console.log(`Called ${day} at ${time}`);
                                }}
                            />
                            {
                                (state.hoverDay) && <p>Mouse hovering at: {state.hoverDay}, {state.hoverTime}</p>
                            }
                        </>
                    )
                }
            </State>
        )
    })
