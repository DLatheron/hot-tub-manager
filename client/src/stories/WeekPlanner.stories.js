import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import WeekPlanner from '../components/WeekPlanner';

storiesOf('WeekPlanner', module)
    .add('default', () => {
        const store = new Store({});

        return (
            <State store={store}>
                <WeekPlanner
                />
            </State>
        )
    })
