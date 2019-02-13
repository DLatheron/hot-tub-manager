import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash';

export default class ScrollableTable extends React.PureComponent {
    static propTypes = {
        columns: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.required,
            title: PropTypes.string,
            sortable: PropTypes.boolean,
            headerClassNames: PropTypes.arrayOf(PropTypes.string),
            classNames: PropTypes.arrayOf(PropTypes.string),
            headerStyle: PropTypes.object,
            style: PropTypes.object,
            template: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.func
            ])
        })),
        sortDir: PropTypes.object,
        selected: PropTypes.string,
        rows: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.required
        })),
        stickyHeaders: PropTypes.bool,
        stickyColumnsLeft: PropTypes.number,
        stickyColumnsRight: PropTypes.number,
        onColumnSelected: PropTypes.func,
        onColumnSortChanged: PropTypes.func
    };

    static defaultProps = {
        columns: [],
        rows: [],
        sortDir: {},
        selected: undefined,
        stickyHeaders: true,
        stickyColumnsLeft: undefined,
        stickyColumnsRight: undefined,
        onColumnSelected: () => {},
        onColumnSortChanged: () => {}
    };

    constructor(props) {
        super(props);

        this.layout = {
            tableRef: React.createRef(),
            columnRefs: {},

            totalWidth: 0,
            cumulativeStickyLeftMargin: {},
            cumulativeStickyRightMargin: {}
        };
    }

    handleColumnHeaderClick = (columnData, event) => {
        const { id } = columnData;

        if (columnData.sortable) {
            if (this.props.selected !== id) {
                return this.props.onColumnSelected(columnData, event);
            }

            this.props.onColumnSortChanged(columnData, event);
        }
    }

    isCompressed() {
        if (!this.layout.tableRef.current) {
            return false;
        }

        const { width: actualWidth } = this.layout.tableRef.current.getBoundingClientRect();
        const { totalWidth: layoutWidth } = this.layout;

        return layoutWidth > actualWidth;
    }

    componentDidMount() {
        window.addEventListener('resize', this.cacheLayout.bind(this));

        // Explicitly force an update because the sizing might take more than one render to
        // determine the correct widths of the columns (if things like selection might affect
        // font size etc.).
        this.forceUpdate();
    }

    componentWillUnmount() {
        // this.clearLayoutCache();
        window.removeEventListener('resize', this.cacheLayout.bind(this));
    }

    cacheLayout() {
        const oldLayoutWidth = this.layout.totalWidth;

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

        if (oldLayoutWidth !== this.layout.totalWidth) {
            this.forceUpdate();
        }
    }

    renderHeaders = (columnData, columnIndex, isCompressed) => {
        if (!this.layout.columnRefs[columnIndex]) {
            this.layout.columnRefs[columnIndex] = React.createRef();
        }

        const stickyLeft = columnIndex <= this.props.stickyColumnsLeft;
        const stickyRight = columnIndex >= this.props.stickyColumnsRight;
        const lastStickyLeft = isCompressed && (columnIndex === this.props.stickyColumnsLeft);
        const lastStickyRight = isCompressed && (columnIndex === this.props.stickyColumnsRight);
        const selected = this.props.selected === columnData.id;

        const classNames = [
            'scrollable-table__row',
            'scrollable-table__row--headers',
            selected && 'selected',
            this.props.stickyHeaders && 'sticky-top',
            (stickyLeft || stickyRight) && 'sticky-sides',
            lastStickyLeft && 'sticky-left-last',
            lastStickyRight && 'sticky-right-last',
            ...(columnData.headerClassNames || [])
        ].filter(Boolean);

        const style = {
            ...columnData.headerStyle,
            left: stickyLeft && this.layout.cumulativeStickyLeftMargin[columnIndex],
            right: stickyRight && this.layout.cumulativeStickyRightMargin[columnIndex]
        };

        const sortDir = this.props.sortDir[columnData.id];

        return (
            <div
                ref={this.layout.columnRefs[columnIndex]}
                key={columnData.id}
                className={classNames.join(' ')}
                style={style}
                onClick={this.handleColumnHeaderClick.bind(this, columnData)}
            >
                {columnData.title} {columnData.sortable && <FontAwesomeIcon icon={sortDir === 1 ? faSortUp : faSortDown} />}
            </div>
        );
    }

    renderRow = (rowData, rowIndex, isCompressed) => {
        const { columns } = this.props;
        const oddRow = rowIndex % 2 === 0;

        return (
            columns.map((columnData, columnIndex) => {
                const stickyLeft = (columnIndex <= this.props.stickyColumnsLeft);
                const stickyRight = (columnIndex >= this.props.stickyColumnsRight);
                const lastStickyLeft = isCompressed && (columnIndex === this.props.stickyColumnsLeft);
                const lastStickyRight = isCompressed && (columnIndex === this.props.stickyColumnsRight);
                const oddColumn = columnIndex % 2 === 0;

                const classNames = [
                    columnData.id,
                    'scrollable-table__row',
                    'scrollable-table__row--data',
                    (stickyLeft || stickyRight) && 'sticky-sides',
                    lastStickyLeft && 'sticky-left-last',
                    lastStickyRight && 'sticky-right-last',
                    oddColumn ? 'odd-column' : 'even-column',
                    oddRow ? 'odd-row' : 'even-row',
                    ...(columnData.classNames || [])
                ].filter(Boolean);

                const style = {
                    ...columnData.style,
                    left: stickyLeft && this.layout.cumulativeStickyLeftMargin[columnIndex],
                    right: stickyRight && this.layout.cumulativeStickyRightMargin[columnIndex]
                };

                return (
                    <div
                        key={`${rowData.id}_${columnData.id}`}
                        className={classNames.join(' ')}
                        style={style}
                    >
                        {
                            typeof(columnData.template) === 'function'
                                ? columnData.template(rowData)
                                : rowData[columnData.template]
                        }
                    </div>
                );
            })
        );
    }

    render() {
        console.log('Rendering');

        this.cacheLayout();

        const { columns, rows } = this.props;
        const isCompressed = this.isCompressed();

        return (
            <div
                ref={this.layout.tableRef}
                className='scrollable-table'
            >
                {
                    // Header row
                    columns.map((columnData, columnIndex) => this.renderHeaders(columnData, columnIndex, isCompressed))
                }
                {
                    // Data row(s)
                    rows.map((rowData, rowIndex) => this.renderRow(rowData, rowIndex, isCompressed))
                }
            </div>
        );
    }
}
