import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import TwoColumnList from '../components/TwoColumnList';
import '../components/TwoColumnList.scss';

storiesOf('TwoColumnList', module)
    .add('default', () => {
        const store = new Store({
            leftTitle: 'Left:',
            rightTitle: 'Right:',
            options:
            // [
            //     { value: 'value1', text: 'Value 1' },
            //     { value: 'value2', text: 'Value 2' },
            //     { value: 'value3', text: 'Value 3' },
            //     { value: 'value4', text: 'Value 4' },
            //     { value: 'value5', text: 'Value 5' }
            // ],
            [
                {
                    text: 'Values 1-5:',
                    values: [
                        { value: 'value1', text: 'Value 1' },
                        { value: 'value2', text: 'Value 2' },
                        { value: 'value3', text: 'Value 3' },
                        { value: 'value4', text: 'Value 4' },
                        { value: 'value5', text: 'Value 5' }
                    ]
                }, {
                    text: 'Values 6-10:',
                    values: [
                        { value: 'value6', text: 'Value 6' },
                        { value: 'value7', text: 'Value 7' },
                        { value: 'value8', text: 'Value 8' },
                        { value: 'value9', text: 'Value 9' },
                        { value: 'value10', text: 'Value 10' }
                    ]
                }, {
                    text: 'Values 11, 12 & 13:',
                    values: [
                        { value: 'value11', text: 'Value 11' },
                        { value: 'value12', text: 'Value 12' },
                        { value: 'value13', text: 'Value 13' }
                    ]
                }
            ],
            initiallySelected: {
                'value3': true
            }
        });

        const onSelectedChanged = (leftSelection, rightSelection) => {
            store.set({ initiallySelected: rightSelection });
        };

        return (
            <State store={store}>
                {
                    state => (
                        <TwoColumnList
                            {...state}
                            onSelectedChanged={onSelectedChanged}
                        />
                    )
                }
            </State>
        )
    })
