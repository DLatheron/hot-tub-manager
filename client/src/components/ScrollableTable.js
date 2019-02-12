import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash';

export default class ScrollableTable extends React.PureComponent {
    static PropTypes = {
        columns: PropTypes.arrayOf(PropTypes.object),
        rows: PropTypes.arrayOf(PropTypes.object),
        stickyHeaders: PropTypes.bool,
        stickyColumnsLeft: PropTypes.number,
        stickyColumnsRight: PropTypes.number,
    };

    static defaultProps = {
        columns: [],
        rows: [],
        stickyHeaders: true,
        stickyColumnsLeft: undefined,
        stickyColumnsRight: undefined,
    };

    constructor(props) {
        super(props);

        this.columnRefs = {};
        this.cumulativeStickyLeftMargin = {};
        this.cumulativeStickyRightMargin = {};
    }

    handleColumnHeaderClick = (event, column) => {
        console.log(`Column Header '${column.id}' clicked!`);
    }

    componentDidMount() {
        const totalWidth = _.reduce(
            this.columnRefs,
            (acc, columnRef) => acc += columnRef.current.getBoundingClientRect().width,
            0
        );

        let stickyLeftMargin = 0;
        let stickyRightMargin = totalWidth;

        _.forEach(this.columnRefs, (columnRef, index) => {
            this.cumulativeStickyLeftMargin[index] = stickyLeftMargin;
            stickyLeftMargin += columnRef.current.getBoundingClientRect().width;
            stickyRightMargin -= columnRef.current.getBoundingClientRect().width;
            this.cumulativeStickyRightMargin[index] = stickyRightMargin;
        });

        this.forceUpdate();
    }

    componentWillUnmount() {
        this.columnRefs = {};
        this.cumulativeStickyLeftMargin = {};
        this.cumulativeStickyRightMargin = {};
    }

    renderHeaders = (column, index) => {
        if (!this.columnRefs[index]) {
            this.columnRefs[index] = React.createRef();
        }

        const stickyLeft = (index <= this.props.stickyColumnsLeft);
        const stickyRight = (index >= this.props.stickyColumnsRight);

        const classNames = [
            'scrollable-table__row',
            'scrollable-table__row--headers',
            this.props.stickyHeaders && 'sticky-top',
            (stickyLeft || stickyRight) && 'sticky-left-right',
        ].filter(Boolean);

        const style = {
            ...column.style,
            left: stickyLeft && this.cumulativeStickyLeftMargin[index],
            right: stickyRight && this.cumulativeStickyRightMargin[index]
        };

        return (
            <div
                ref={this.columnRefs[index]}
                key={column.id}
                className={classNames.join(' ')}
                style={style}
                onClick={(event) => this.handleColumnHeaderClick(event, column)}
            >
                {column.name} <FontAwesomeIcon icon={column.sortDir === 1 ? faSortUp : faSortDown} />
            </div>
        );
    }

    renderRow = (rowData) => {
        const { columns } = this.props;

        return (
            columns.map((column, index) => {
                const stickyLeft = (index <= this.props.stickyColumnsLeft);
                const stickyRight = (index >= this.props.stickyColumnsRight);
                const lastStickyLeft = (index === this.props.stickyColumnsLeft);
                const lastStickyRight = (index === this.props.stickyColumnsRight);

                const classNames = [
                    column.id,
                    'scrollable-table__row',
                    'scrollable-table__row--data',
                    (stickyLeft || stickyRight) && 'sticky-left-right',
                    lastStickyLeft && 'sticky-left-last',
                    lastStickyRight && 'sticky-right-last'
                ].filter(Boolean);

                const style = {
                    ...column.style,
                    left: stickyLeft && this.cumulativeStickyLeftMargin[index],
                    right: stickyRight && this.cumulativeStickyRightMargin[index]
                };

                return (
                    <div
                        className={classNames.join(' ')}
                        style={style}
                    >
                        { column.template(rowData) }
                    </div>
                );
            })
        );

        // return (
        //     <>
        //         <div
        //             className={`sticky-left scrollable-table__row scrollable-table__row--data ${columns[0].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[0].template(rowData) }
        //         </div>
        //         <div
        //             className={`sticky-left-last sticky-right scrollable-table__row scrollable-table__row--data ${columns[1].id}`}
        //             style={{
        //                 left: '100px'
        //             }}
        //         >
        //             { columns[1].template(rowData) }
        //         </div>
        //         <div
        //             className={`scrollable-table__row scrollable-table__row--data ${columns[2].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[2].template(rowData) }
        //         </div>
        //         <div
        //             className={`scrollable-table__row scrollable-table__row--data ${columns[3].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[3].template(rowData) }
        //         </div>
        //         <div
        //             className={`scrollable-table__row scrollable-table__row--data ${columns[4].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[4].template(rowData) }
        //         </div>
        //         <div
        //             className={`scrollable-table__row scrollable-table__row--data ${columns[5].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[5].template(rowData) }
        //         </div>
        //         <div
        //             className={`last-non-sticky scrollable-table__row scrollable-table__row--data ${columns[6].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[6].template(rowData) }
        //         </div>
        //         <div
        //             className={`sticky-right-last sticky-right scrollable-table__row scrollable-table__row--data ${columns[7].id}`}
        //             style={{
        //             }}
        //         >
        //             { columns[7].template(rowData) }
        //         </div>
        //     </>
        // );
    }

    render() {
        const { columns, rows } = this.props;

        return (
            <div className='scrollable-table'>
                {
                    // Header row
                    columns.map(this.renderHeaders)
                }
                {
                    // Data row(s)
                    rows.map(this.renderRow)
                }
            </div>
        );
    }
}
