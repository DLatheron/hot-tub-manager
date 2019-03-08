import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

export class Menu {
    constructor(id, title, options = null, defaultSelectionId) {
        this.id = id;
        this.title = title;
        this.options = options;
        this.defaultSelectionId = defaultSelectionId;
    }

    iterate(iterationFn) {
        function _iterate(menu, parentTree) {
            iterationFn(menu, parentTree);

            if (menu.options) {
                parentTree = [...parentTree, menu];

                menu.options.forEach(subMenu => {
                    _iterate(subMenu, parentTree);
                });
            }
        }

        _iterate(this, []);
    }
}

HeaderMenuItem.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    active: PropTypes.bool,
    handleClick: PropTypes.func.isRequired
};

export function HeaderMenuItem({ id, title, active = false, handleClick }) {
    return (
        <div
            id={id}
            className={classNames('item', active && 'active')}
            onClick={handleClick}
        >
            {title}
        </div>
    );
}

HeaderMenu.propTyoes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    activeMenu: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleClick: PropTypes.func.isRequired,
};

export function HeaderMenu({ menu, activeMenu, handleClick }) {
    return (
        <div className='header-menu'>
            {
                menu.options.map(subMenu =>
                    <HeaderMenuItem
                        key={subMenu.id}
                        {...subMenu}
                        active={subMenu.id === activeMenu[0]}
                        handleClick={handleClick.bind(this, subMenu)}
                    />
                )
            }
        </div>
    );
}

SideMenu.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    openMenus: PropTypes.object,
    activeMenu: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleClick: PropTypes.func.isRequired
};

export function SideMenu({ menu, openMenus, activeMenu, handleClick }) {
    // TODO: Clean-up and allow full recursion of items.
    return (
        <div className='side-menu'>
            <h3>{menu.title}</h3>
            <ul>
                {
                    menu.options && menu.options.map(subMenu =>
                        <SideMenuItem
                            key={subMenu.id}
                            {...subMenu}
                            open={openMenus[subMenu.id]}
                            active={subMenu.id === activeMenu[1]}
                            handleClick={handleClick.bind(this, subMenu)}
                        >
                            {
                                subMenu.options &&
                                    <ul>
                                        {
                                            subMenu.options.map(subSubMenu =>
                                                <SideMenuItem
                                                    key={subSubMenu.id}
                                                    {...subSubMenu}
                                                    open={openMenus[subSubMenu.id]}
                                                    active={subSubMenu.id === activeMenu[1]}
                                                    handleClick={handleClick.bind(this, subSubMenu)}
                                                />
                                            )
                                        }
                                    </ul>
                            }
                        </SideMenuItem>
                    )
                }
            </ul>
        </div>
    );
}

SideMenuItem.propTypes = {
    title: PropTypes.string,
    active: PropTypes.bool,
    open: PropTypes.bool,
    children: PropTypes.element,
    handleClick: PropTypes.func
};

export function SideMenuItem({ title = '', active = false, open = false, children = null, handleClick = () => {} }) {
    const canCollapse = () => {
        return children !== null;
    }

    const onClick = (event) => {
        event.stopPropagation();

        handleClick(event);
    }

    const determineIcon = () => {
        return !canCollapse() ? null
            : open
                ? faCaretUp
                : faCaretDown;
    }

    const icon = determineIcon();

    return (
        <div
            className='collapsible-element'
            onClick={onClick}
        >
            <div className={classNames('top-level', active && 'active')}>
                {
                    icon
                        ? <FontAwesomeIcon icon={icon} />
                        : <span className='spacer' />
                }
                <span className='title'>
                    {title}
                </span>
            </div>
            {
                canCollapse() &&
                    <div className='collapsible-body' style={{ maxHeight: open ? '6rem' : 0 }}>
                        {children}
                    </div>
            }
        </div>
    );
}

export default class MainPage extends React.PureComponent {
    static propTypes = {
        menu: PropTypes.instanceOf(Menu).isRequired,
        defaultMenu: PropTypes.arrayOf(PropTypes.string).isRequired
    };

    static defaultProps = {
        menu: new Menu('main', '', [
            new Menu('creative', 'Creative', [
                new Menu('uas', 'Underlying Ads', [
                    new Menu('creative_uas_import', 'Import'),
                    new Menu('creative_uas_adHarvesting', 'Ad Harvesting'),
                    new Menu('creative_uas_metadataQueue', 'Metadata Queue'),
                    new Menu('creative_uas_approvalQueue', 'Approval Queue')
                ])
            ], 'creative_uas_import'),
            new Menu('reporting', 'Reporting', [
                new Menu('internal', 'Internal', [
                    new Menu('reporting_internal_dashboard', 'Dashboard'),
                    new Menu('reporting_internal_kpis', 'KPIs'),
                    new Menu('reporting_internal_milestones', 'Milestones')
                ]),
                new Menu('device-partner', 'Device Partner', [
                    new Menu('reporting_device-partner_dashboard', 'Dashboard'),
                    new Menu('reporting_device-partner_kpis', 'KPIs'),
                    new Menu('reporting_device-partner_milestones', 'Milestones')
                ]),
                new Menu('inventory-parner', 'Inventory Partner', [
                    new Menu('reporting_inventory-partner_dashboard', 'Dashboard'),
                    new Menu('reporting_inventory-partner_kpis', 'KPIs'),
                    new Menu('reporting_inventory-partner_milestones', 'Milestones')
                ]),
                new Menu('exchange', 'Exchange', [
                    new Menu('reporting_exchange_dashboard', 'Dashboard'),
                    new Menu('reporting_exchange_kpis', 'KPIs'),
                    new Menu('reporting_exchange_milestones', 'Milestones')
                ]),
                new Menu('simple', 'Simple')
            ], 'reporting_device-partner_dashboard'),
            new Menu('channels', 'Channels'),
            new Menu('devices', 'Devices'),
            new Menu('admin', 'Admin')
        ]),
        defaultMenu: ['reporting', 'reporting_internal_kpis']
    };

    constructor(props) {
        super(props);

        this.state = {
            lastSelections: {},
            activeMenu: props.defaultMenu,
            ...this.openAppropriateMenus(props.defaultMenu[1])
        };
    }

    openAppropriateMenus(menuId) {
        const openMenus = {};

        this.props.menu.iterate((subMenu, parentTree) => {
            if (subMenu.id === menuId) {
                parentTree.forEach(menu => {
                    openMenus[menu.id] = true
                });
            }
        });

        console.log(`openMenus: ${JSON.stringify(openMenus, null, 4)}`);
        return { openMenus };
    }

    handleMenuClick = (menu) => {
        console.log(`Menu clicked: ${menu}`);

        const defaultSubMenu = this.state.lastSelections[menu.id] || menu.defaultSelectionId;
        const defaultSelectionId = [menu.id, defaultSubMenu]
        const activeMenu = defaultSelectionId || [menu.id, this.state.activeMenu[1]];

        if (this.state.activeMenu[0] !== activeMenu[0] || this.state.activeMenu[1] !== activeMenu[1]) {
            this.setState({ activeMenu });
        }

        this.setState(this.openAppropriateMenus(activeMenu[1]));
    }

    handleSubMenuClick = (subMenu) => {
        console.log(`Sub menu clicked: ${subMenu}`);

        if (subMenu.options) {
            const openMenus = {};

            if (openMenus[subMenu.id]) {
                delete openMenus[subMenu.id];
            } else {
                openMenus[subMenu.id] = true;
            }

            this.setState({ openMenus });
        } else {
            const activeMenu = [this.state.activeMenu[0], subMenu.id];

            if (this.state.activeMenu[0] !== activeMenu[0] || this.state.activeMenu[1] !== activeMenu[1]) {
                this.setState({ activeMenu });
            }

            this.setState({
                lastSelections: {
                    ...this.state.lastSelections,
                    [this.state.activeMenu[0]]: subMenu.id
                }
            });
        }
    }

    render() {
        const { menu } = this.props;
        const { activeMenu } = this.state;
        const sideMenu = menu.options.find(value => value.id === activeMenu[0]);

        return (
            <div className='main-page'>
                <div className='top-bar'>
                    <img src='n-tab.png' alt='Nielsen logo' />
                    <HeaderMenu
                        menu={menu}
                        activeMenu={this.state.activeMenu}
                        handleClick={this.handleMenuClick}
                    />
                </div>
                {
                    sideMenu.options &&
                        <SideMenu
                            menu={sideMenu}
                            activeMenu={this.state.activeMenu}
                            openMenus={this.state.openMenus}
                            handleClick={this.handleSubMenuClick}
                        />
                }
                <div className='body'>Body content goes here...</div>
                <div className='footer'>
                    <p>© Copyright 2019, Nielsen Media Inc, All Rights Reserved.</p>
                </div>
            </div>
        );
    }
}
