import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import MainPage from '../components/MainPage';
import '../components/MainPage.scss';

storiesOf('MainPage', module)
    .add('default', () => {
        const store = new Store({});

        return (
            <State store={store}>
                {
                    state => (
                        <MainPage>{}</MainPage>
                    )
                }
            </State>
        );
    });
