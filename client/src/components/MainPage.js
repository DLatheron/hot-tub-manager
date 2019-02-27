import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'

// TODO:
// - Option to only have a single sub-menu (at a given level) open;
export class Menu {
    constructor(id, title, options = null, defaultSelection) {
        this.id = id;
        this.title = title;
        this.options = options;
        this.defaultSelection = defaultSelection;
    }
}

export class HeaderMenuItem extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        active: PropTypes.bool,
        handleClick: PropTypes.func.isRequired
    };
    static defaultProps = {
        active: false
    };

    render() {
        const { id, active, title, handleClick } = this.props;

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
}

export class HeaderMenu extends React.PureComponent {
    static propTyoes = {
        menu: PropTypes.instanceOf(Menu).isRequired,
        activeMenu: PropTypes.arrayOf(PropTypes.string).isRequired,
        handleClick: PropTypes.func.isRequired,
    };
    static defaultProps = {
        options: []
    };

    render() {
        const { menu, activeMenu, handleClick } = this.props;

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
}

export class SideMenu extends React.PureComponent {
    static propTypes = {
        menu: PropTypes.instanceOf(Menu).isRequired,
        activeMenu: PropTypes.arrayOf(PropTypes.string).isRequired,
        handleClick: PropTypes.func.isRequired
    };
    static defaultProps = {
        options: []
    };
    state = {};

    render() {
        const { menu, activeMenu, handleClick } = this.props;

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
}

export class SideMenuItem extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        active: PropTypes.bool,
        children: PropTypes.element,
        handleClick: PropTypes.func
    };
    static defaultProps = {
        title: '',
        active: false,
        children: null,
        handleClick: () => {}
    };
    state = {
        collapsed: true
    };

    canCollapse = () => {
        return this.props.children !== null;
    }

    handleClick = (event) => {
        event.stopPropagation();

        if (this.canCollapse()) {
            this.setState(state => ({ collapsed: !state.collapsed }));
        } else {
            this.props.handleClick(event);
        }
    }

    determineIcon = () => {
        return !this.canCollapse() ? null
            : this.state.collapsed
                ? faCaretDown
                : faCaretUp;
    }

    render() {
        const { children, active, title } = this.props;
        const { collapsed } = this.state;
        const icon = this.determineIcon();

        return (
            <div
                className='collapsible-element'
                onClick={this.handleClick}
            >
                <div className={classNames('top-level', active && 'active')}>
                    {
                        icon
                            ? <FontAwesomeIcon icon={icon} />
                            : <span class='spacer' />
                    }
                    <span className='title'>
                        {title}
                    </span>
                </div>
                {
                    this.canCollapse() &&
                        <div className='collapsible-body' style={{ maxHeight: collapsed ? 0 : '5rem' }}>
                            {children}
                        </div>
                }
            </div>
        );
    }
}

export default class MainPage extends React.PureComponent {
    static propTypes = {
    };
    static defaultProps = {
        menu: new Menu('main', '', [
            new Menu('creative', 'Creative', [
                new Menu('creative_import', 'Import'),
                new Menu('creative_adHarvesting', 'Ad Harvesting'),
                new Menu('creative_metadataQueue', 'Metadata Queue'),
                new Menu('creative_approvalQueue', 'Approval Queue')
            ], ['creative', 'creative_import']),
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
            ], ['reporting', 'reporting_device-partner_dashboard']),
            new Menu('channels', 'Channels'),
            new Menu('devices', 'Devices'),
            new Menu('admin', 'Admin')
        ])
    };
    state = {
        activeMenu: ['reporting', 'reporting_internal_kpis']
    };

    handleMenuClick = (menu) => {
        console.log(`Menu clicked: ${menu}`);

        this.setState(state => ({
            activeMenu: menu.defaultSelection || [menu.id, state.activeMenu[1]]
        }));
    }

    handleSubMenuClick = (subMenu) => {
        console.log(`Sub menu clicked: ${subMenu}`);

        this.setState(state => ({
            activeMenu: [state.activeMenu[0], subMenu.id]
        }));
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
