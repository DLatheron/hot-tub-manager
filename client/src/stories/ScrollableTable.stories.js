import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import ScrollableTable from '../components/ScrollableTable';
import '../components/ScrollableTable.scss';

storiesOf('ScrollableTable', module)
    .add('default', () => {
        const store = new Store({
            columns: [
                { id: 'columnA', name: 'Column A', sortDir:  1, classNames: ['sticky-top', 'sticky-left'], template: rowData => {
                    return rowData.name;
                } },
                { id: 'columnB', name: 'Column B', sortDir:  1, selected: true, classNames: ['sticky-top', 'sticky-left'], template: rowData => {
                    return rowData.number;
                }, style: {
                    left: '100px'
                } },
                { id: 'columnC', name: 'Column C', sortDir: -1, classNames: ['sticky-top'], template: rowData => {
                    return rowData.name;
                } },
                { id: 'columnD', name: 'Column D', sortDir:  1, classNames: ['sticky-top'], template: rowData => {
                    return rowData.number.toString().padStart(4, '0');
                } },
                { id: 'columnE', name: 'Column E', sortDir:  1, classNames: ['sticky-top'], template: rowData => {
                    return rowData.name;
                } },
                { id: 'columnF', name: 'Column F', sortDir:  1, classNames: ['sticky-top'], template: rowData => {
                    return rowData.number;
                } },
                { id: 'columnG', name: 'Column G', sortDir: -1, classNames: ['sticky-top'], template: rowData => {
                    return rowData.name;
                } },
                { id: 'columnH', name: 'Column H', sortDir:  1, classNames: ['sticky-top', 'sticky-right'], template: rowData => {
                    return rowData.number.toString().padStart(4, '0');
                } }
            ],
            rows: [
                { id: 'A', name: 'A', number:  0 },
                { id: 'B', name: 'B', number:  1 },
                { id: 'C', name: 'C', number:  2 },
                { id: 'D', name: 'D', number:  3 },
                { id: 'E', name: 'E', number:  4 },
                { id: 'F', name: 'F', number:  5 },
                { id: 'G', name: 'G', number:  6 },
                { id: 'H', name: 'H', number:  7 },
                { id: 'I', name: 'I', number:  8 },
                { id: 'J', name: 'J', number:  9 },
                { id: 'K', name: 'K', number: 10 },
                { id: 'L', name: 'L', number: 11 }
            ]
        });

        return (
            <State store={store}>
                {
                    state => (
                        <ScrollableTable
                            rows={state.rows}
                            columns={state.columns}
                            stickyColumnsLeft={1}
                            stickyColumnsRight={7}
                        />
                    )
                }
            </State>
        )
    })
