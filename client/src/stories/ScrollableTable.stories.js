import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from "@storybook/react";

import ScrollableTable from '../components/ScrollableTable';
import '../components/ScrollableTable.scss';
import './ScrollableTableColumns.scss';

storiesOf('ScrollableTable', module)
    .add('default', () => {
        const store = new Store({
            columns: [
                {
                    id: 'columnA',
                    title: 'Column A',
                    sortable: true,
                    headerClassNames: [
                    ],
                    classNames: [
                        'bold'
                    ],
                    headerStyle: {
                    },
                    style: {
                        color: 'brown'
                    },
                    template: 'name',
                    width: '200px'
                }, {
                    id: 'columnB',
                    title: 'Column B',
                    sortable: true,
                    selected: true,
                    style: {},
                    template: 'number',
                }, {
                    id: 'columnC',
                    title: 'Column C',
                    sortable: true,
                    classNames: [],
                    template: 'name',
                    width: '200px'
                }, {
                    id: 'columnD',
                    title: 'Column D',
                    sortable: false,
                    classNames: [],
                    template: rowData => rowData.number.toString().padStart(4, '0'),
                    width: '100px'
                }, {
                    id: 'columnE',
                    title: 'Column E',
                    classNames: [],
                    template: 'undef',
                    width: '100px'
                }, {
                    id: 'columnF',
                    title: 'Column F',
                    classNames: [],
                    template: 'number',
                    width: '100px'
                }, {
                    id: 'columnG',
                    title: 'Column G',
                    classNames: [],
                    template: 'name',
                    width: '200px'
                }, {
                    id: 'columnH',
                    title: 'Column H',
                    classNames: [],
                    template: rowData => rowData.number.toString().padStart(4, '0'),
                    width: '100px'
                }
            ],
            sortDir: {
                columnA: 1,
                columnB: -1,
                columnC: 1
            },
            selected: 'columnA',
            rows: [
                { id: 'A', name: 'A', number:  0, undef: undefined },
                { id: 'B', name: 'B', number:  1, undef: undefined },
                { id: 'C', name: 'C', number:  2, undef: undefined },
                { id: 'D', name: 'D', number:  3, undef: undefined },
                { id: 'E', name: 'E', number:  4, undef: undefined },
                { id: 'F', name: 'F', number:  5, undef: undefined },
                { id: 'G', name: 'G', number:  6, undef: undefined },
                { id: 'H', name: 'H', number:  7, undef: undefined },
                { id: 'I', name: 'I', number:  8, undef: undefined },
                { id: 'J', name: 'J', number:  9, undef: undefined },
                { id: 'K', name: 'K', number: 10, undef: undefined },
                { id: 'L', name: 'L', number: 11, undef: undefined }
            ],
            classNames: [],
            style: {}
        });

        const columnSelectedHandler = columnData => {
            console.log('columnSelectedHandler called');
            const { id: selected } = columnData;
            store.set({ selected });
        }

        const columnSortHandler = columnData => {
            console.log('columnSortHandler called');
            const { id } = columnData;

            const sortDir = { ...store.get('sortDir') };
            sortDir[id] = 0 - (sortDir[id] || 1);

            store.set({ sortDir });
        };

        return (
            <State store={store}>
                {
                    state => (
                        <ScrollableTable
                            rows={state.rows}
                            sortDir={state.sortDir}
                            selected={state.selected}
                            columns={state.columns}
                            stickyColumnsLeft={1}
                            stickyColumnsRight={7}
                            onColumnSelected={columnSelectedHandler}
                            onColumnSortChanged={columnSortHandler}
                        />
                    )
                }
            </State>
        )
    })
