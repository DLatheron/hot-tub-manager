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

        this.clearLayoutCache();
    }

    handleColumnHeaderClick = (event, column) => {
        console.log(`Column Header '${column.id}' clicked!`);
    }

    isCompressed() {
        if (!this.layout.tableRef.current) {
            return false;
        }

        const { width: actualWidth } = this.layout.tableRef.current.getBoundingClientRect();
        const { totalWidth: layoutWidth } = this.layout;

        console.log(`layoutWidth: ${layoutWidth} > actualWidth: ${actualWidth} = ${layoutWidth > actualWidth}`);

        return layoutWidth > actualWidth;
    }

    componentDidMount() {
        this.cacheLayout();
        window.addEventListener('resize', this.cacheLayout.bind(this));
    }

    componentWillUnmount() {
        this.clearLayoutCache();
        window.removeEventListener('resize', this.cacheLayout.bind(this));
    }

    cacheLayout() {
        this.layout.totalWidth = _.reduce(
            this.layout.columnRefs,
            (acc, columnRef) => acc += columnRef.current.getBoundingClientRect().width,
            0
        );

        let stickyLeftMargin = 0;
        let stickyRightMargin = this.layout.totalWidth;

        _.forEach(this.layout.columnRefs, (columnRef, index) => {
            this.layout.cumulativeStickyLeftMargin[index] = stickyLeftMargin;
            stickyLeftMargin += columnRef.current.getBoundingClientRect().width;
            stickyRightMargin -= columnRef.current.getBoundingClientRect().width;
            this.layout.cumulativeStickyRightMargin[index] = stickyRightMargin;
        });

        this.forceUpdate();
    }

    clearLayoutCache() {
        this.layout = {
            tableRef: React.createRef(),
            columnRefs: {},

            totalWidth: 0,
            cumulativeStickyLeftMargin: {},
            cumulativeStickyRightMargin: {}
        };
    }

    renderHeaders = (column, index) => {
        if (!this.layout.columnRefs[index]) {
            this.layout.columnRefs[index] = React.createRef();
        }

        const stickyLeft = (index <= this.props.stickyColumnsLeft);
        const stickyRight = (index >= this.props.stickyColumnsRight);

        const classNames = [
            'scrollable-table__row',
            'scrollable-table__row--headers',
            this.props.stickyHeaders && 'sticky-top',
            (stickyLeft || stickyRight) && 'sticky-sides',
        ].filter(Boolean);

        const style = {
            ...column.style,
            left: stickyLeft && this.layout.cumulativeStickyLeftMargin[index],
            right: stickyRight && this.layout.cumulativeStickyRightMargin[index]
        };

        return (
            <div
                ref={this.layout.columnRefs[index]}
                key={column.id}
                className={classNames.join(' ')}
                style={style}
                onClick={(event) => this.handleColumnHeaderClick(event, column)}
            >
                {column.name} <FontAwesomeIcon icon={column.sortDir === 1 ? faSortUp : faSortDown} />
            </div>
        );
    }

    renderRow = (rowData, rowIndex) => {
        const { columns } = this.props;
        const oddRow = rowIndex % 2 === 0;
        const isCompressed = this.isCompressed();

        return (
            columns.map((columnData, colIndex) => {
                const stickyLeft = (colIndex <= this.props.stickyColumnsLeft);
                const stickyRight = (colIndex >= this.props.stickyColumnsRight);
                const lastStickyLeft = isCompressed && (colIndex === this.props.stickyColumnsLeft);
                const lastStickyRight = isCompressed && (colIndex === this.props.stickyColumnsRight);
                const oddColumn = colIndex % 2 === 0;

                const classNames = [
                    columnData.id,
                    'scrollable-table__row',
                    'scrollable-table__row--data',
                    (stickyLeft || stickyRight) && 'sticky-sides',
                    lastStickyLeft && 'sticky-left-last',
                    lastStickyRight && 'sticky-right-last',
                    oddColumn ? 'odd-column' : 'even-column',
                    oddRow ? 'odd-row' : 'even-row'
                ].filter(Boolean);

                const style = {
                    ...columnData.style,
                    left: stickyLeft && this.layout.cumulativeStickyLeftMargin[colIndex],
                    right: stickyRight && this.layout.cumulativeStickyRightMargin[colIndex]
                };

                return (
                    <div
                        className={classNames.join(' ')}
                        style={style}
                    >
                        { columnData.template(rowData) }
                    </div>
                );
            })
        );
    }

    render() {
        const { columns, rows } = this.props;

        console.log('Rendering');

        return (
            <div
                ref={this.layout.tableRef}
                className='scrollable-table'
            >
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
