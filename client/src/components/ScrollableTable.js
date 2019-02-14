import React from 'react';
import PropTypes from 'prop-types';
import StylePropType from 'react-style-proptype';
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
            headerStyle: StylePropType,
            style: StylePropType,
            template: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.func
            ])
        })),
        sortDir: (props, propName, componentName) => {
            const prop = props[propName];

            for (let property in prop) {
                if (prop.hasOwnProperty(property)) {
                    const value = prop[property];
                    if (typeof(value) !== "number" || Math.abs(value) !== 1) {
                        return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
                    }
                }
            }
        },
        selected: PropTypes.string,
        rows: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.required
        })),
        className: PropTypes.arrayOf(PropTypes.string),
        style: StylePropType,
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

    static isOdd(index) {
        return index % 2 === 0;
    }

    static getDefinedClassNames(classNames) {
        return classNames
            .filter(Boolean)
            .join(' ');
    }

    constructor(props) {
        super(props);

        this.layout = {
            tableRef: React.createRef(),
            gridTemplateColumns: this.getGridTemplateColumns(),

            columnRefs: {},
            totalWidth: 0,
            cumulativeStickyLeftMargin: {},
            cumulativeStickyRightMargin: {}
        };
    }

    isCompressed() {
        if (!this.layout.tableRef.current) {
            return false;
        }

        const { width: actualWidth } = this.layout.tableRef.current.getBoundingClientRect();
        const { totalWidth: layoutWidth } = this.layout;

        return layoutWidth > actualWidth;
    }

    isColumnSticky(columnIndex, isCompressed) {
        return {
            left: columnIndex <= this.props.stickyColumnsLeft,
            right: columnIndex >= this.props.stickyColumnsRight,
            lastLeft: isCompressed && (columnIndex === this.props.stickyColumnsLeft),
            lastRight: isCompressed && (columnIndex === this.props.stickyColumnsRight)
        };
    }

    isColumnSelected(columnData) {
        return this.props.selected === columnData.id;
    }

    getStickyHeaderStyles(sticky) {
        return [this.props.stickyHeaders && 'sticky-top']
            .concat(this.getStickyStyles(sticky));
    }

    getStickyStyles(sticky) {
        return [
            (sticky.left || sticky.right) && 'sticky-sides',
            sticky.lastLeft && 'sticky-left-last',
            sticky.lastRight && 'sticky-right-last',
        ];
    }

    getHeaderStyle(baseStyle, columnIndex, sticky) {
        return {
            ...baseStyle,
            left: sticky.left && this.layout.cumulativeStickyLeftMargin[columnIndex],
            right: sticky.right && this.layout.cumulativeStickyRightMargin[columnIndex]
        };
    }

    getStyle(baseStyle, columnIndex, sticky) {
        return {
            ...baseStyle,
            left: sticky.left && this.layout.cumulativeStickyLeftMargin[columnIndex],
            right: sticky.right && this.layout.cumulativeStickyRightMargin[columnIndex]
        };
    }

    getGridTemplateColumns() {
        return this.props.columns.map(({ width }) => width || '1fr').join(' ');
    }

    componentDidMount() {
        window.addEventListener('resize', this.cacheLayout.bind(this));

        this.cacheLayout();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.cacheLayout.bind(this));
    }

    cacheLayout() {
        const oldLayoutWidth = this.layout.totalWidth;

        this.layout.totalWidth = _.reduce(
            this.layout.columnRefs,
            (acc, columnRef) => acc += columnRef.current.getBoundingClientRect().width,
            0
        );

        this.layout.minWidth = 0;
        let stickyLeftMargin = 0;
        let stickyRightMargin = this.layout.totalWidth;

        _.forEach(this.layout.columnRefs, (columnRef, columnIndex) => {
            const { width } = columnRef.current.getBoundingClientRect();

            const sticky = this.isColumnSticky(columnIndex);
            if (sticky.left || sticky.right) {
                this.layout.minWidth += width;
            }

            this.layout.cumulativeStickyLeftMargin[columnIndex] = Math.floor(stickyLeftMargin);
            stickyLeftMargin += width;
            stickyRightMargin -= width;
            this.layout.cumulativeStickyRightMargin[columnIndex] = Math.floor(stickyRightMargin);
        });

        if (oldLayoutWidth !== this.layout.totalWidth) {
            this.forceUpdate();
        }
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

    renderHeaders = (columnData, columnIndex, isCompressed) => {
        if (!this.layout.columnRefs[columnIndex]) {
            this.layout.columnRefs[columnIndex] = React.createRef();
        }

        const sticky = this.isColumnSticky(columnIndex, isCompressed);
        const selected = this.isColumnSelected(columnData);

        const classNames = ScrollableTable.getDefinedClassNames([
            'row',
            'row-header',
            columnData.sortable && 'row-header-sortable',
            selected && 'selected',
            ...this.getStickyHeaderStyles(sticky, isCompressed),
            ...(columnData.headerClassNames || [])
        ]);

        const sortDir = this.props.sortDir[columnData.id];

        return (
            <div
                ref={this.layout.columnRefs[columnIndex]}
                key={columnData.id}
                className={classNames}
                style={this.getHeaderStyle(columnData.style, columnIndex, sticky)}
                onClick={this.handleColumnHeaderClick.bind(this, columnData)}
            >
                {columnData.title} {columnData.sortable && <FontAwesomeIcon icon={sortDir === -1 ? faSortDown : faSortUp } />}
            </div>
        );
    }

    renderRow = (rowData, rowIndex, isCompressed) => {
        const { columns } = this.props;
        const oddRow = ScrollableTable.isOdd(rowIndex);

        return (
            columns.map((columnData, columnIndex) => {
                const sticky = this.isColumnSticky(columnIndex, isCompressed);
                const selected = this.isColumnSelected(columnData);
                const oddColumn = ScrollableTable.isOdd(columnIndex);

                const classNames = ScrollableTable.getDefinedClassNames([
                    columnData.id,
                    'row',
                    'row-data',
                    selected && 'selected',
                    ...this.getStickyStyles(sticky, isCompressed),
                    oddColumn ? 'odd-column' : 'even-column',
                    oddRow ? 'odd-row' : 'even-row',
                    ...(columnData.classNames || [])
                ]);

                return (
                    <div
                        key={`${rowData.id}_${columnData.id}`}
                        className={classNames}
                        style={this.getStyle(columnData.style, columnIndex, sticky)}
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
        const { columns, rows } = this.props;
        const isCompressed = this.isCompressed();

        return (
            <div
                ref={this.layout.tableRef}
                className={
                    ScrollableTable.getDefinedClassNames([
                        'scrollable-table',
                        ...(this.props.className || [])
                    ])
                }
                style={{
                    minWidth: this.layout.minWidth > 0 && this.layout.minWidth,
                    gridTemplateColumns: this.layout.gridTemplateColumns,
                    ...(this.props.style || {})
                }}
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
