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

    handleColumnHeaderClick = (event) => {
        const { target } = event;

        console.log(`Column Header '${target.key}' clicked!`);
    }

    renderRow = (rowData) => {
        const { columns } = this.props;
        return (
                <>
            {/* // <div
            //     key={rowData.id}
            //     className='scrollable-table__row scrollable-table__row--data'
            //     // style={{ gridTemplateColumns: '100px 100px 100px 100px 100px 100px 100px 100px' }}
            // > */}
                <div
                    className={`sticky-left scrollable-table__row scrollable-table__row--data ${columns[0].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[0].template(rowData) }
                </div>
                <div
                    className={`sticky-right scrollable-table__row scrollable-table__row--data ${columns[1].id}`}
                    style={{
                        left: '100px'
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[1].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[2].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[2].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[3].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[3].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[4].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[4].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[5].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[5].template(rowData) }
                </div>
                <div
                    className={`scrollable-table__row scrollable-table__row--data ${columns[6].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[6].template(rowData) }
                </div>
                <div
                    className={`sticky-right scrollable-table__row scrollable-table__row--data ${columns[7].id}`}
                    style={{
                    }}
                    onClick={this.handleColumnHeaderClick}
                >
                    { columns[7].template(rowData) }
                </div>
            {/* </div> */}
            </>
        );
    }

    render() {
        const { columns, rows } = this.props;

        return (
            <div className='scrollable-table'>
                {/* Table Header */}
                {/* <div
                    className="scrollable-table__row scrollable-table__row--headers"
                    // style={{ gridTemplateColumns: '100px 100px 100px 100px 100px 100px 100px 100px' }}
                > */}
                    {/* { columns.map(column => <span className={column.selected && 'selected'}>{column.name} <FontAwesomeIcon icon={column.sortDir === 1 ? faSortUp : faSortDown} /></span>)} */}
                {
                    columns.map(column =>
                        <div
                            className={`scrollable-table__row scrollable-table__row--headers ${column.classNames.join(' ')}`}
                            style={column.style}
                        >
                            {column.name} <FontAwesomeIcon icon={column.sortDir === 1 ? faSortUp : faSortDown} />
                        </div>
                    )
                }
                {/* </div> */}
                {/* <div
                    className="scrollable-table__body"
                > */}
                { rows.map(this.renderRow) }
                {/* </div> */}
            </div>
        );
    }
}
