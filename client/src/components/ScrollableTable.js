import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

export default class ScrollableTable extends React.PureComponent {
    static PropTypes = {
        columns: PropTypes.arrayOf(PropTypes.object),
        rows: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        columns: [],
        rows: []
    };

    handleColumnHeaderClick = (event, column) => {
        console.log(`Column Header '${column.id}' clicked!`);
    }

    renderRow = (rowData) => {
        const { columns } = this.props;
        return (
            <>
                <div
                    className={`sticky-left scrollable-table__row scrollable-table__row--data ${columns[0].id}`}
                    style={{
                    }}
                >
                    { columns[0].template(rowData) }
                </div>
                <div
                    className={`sticky-left-last sticky-right scrollable-table__row scrollable-table__row--data ${columns[1].id}`}
                    style={{
                        left: '100px'
                    }}
                >
                    { columns[1].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[2].id}`}
                    style={{
                    }}
                >
                    { columns[2].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[3].id}`}
                    style={{
                    }}
                >
                    { columns[3].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[4].id}`}
                    style={{
                    }}
                >
                    { columns[4].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[5].id}`}
                    style={{
                    }}
                >
                    { columns[5].template(rowData) }
                </div>
                <div
                    className={`last-non-sticky scrollable-table__row scrollable-table__row--data ${columns[6].id}`}
                    style={{
                    }}
                >
                    { columns[6].template(rowData) }
                </div>
                <div
                    className={`sticky-right-last sticky-right scrollable-table__row scrollable-table__row--data ${columns[7].id}`}
                    style={{
                    }}
                >
                    { columns[7].template(rowData) }
                </div>
            </>
        );
    }

    render() {
        const { columns, rows } = this.props;

        return (
            <div className='scrollable-table'>
                {
                    // Header row
                    columns.map(column =>
                        <div
                            className={`ellipsis scrollable-table__row scrollable-table__row--headers ${column.classNames.join(' ')}`}
                            style={column.style}
                            onClick={(event) => this.handleColumnHeaderClick(event, column)}
                        >
                            {column.name} <FontAwesomeIcon icon={column.sortDir === 1 ? faSortUp : faSortDown} />
                        </div>
                    )
                }
                {
                    // Data row(s)
                    rows.map(this.renderRow)
                }
            </div>
        );
    }
}
