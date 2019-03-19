import React, { useRef } from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';
import { BrowserRouter as Router } from "react-router-dom";
import classNames from 'classnames';
import useComponentSize from '@rehooks/component-size'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons'

import MenuComponent, { Menu, Separator, ProfileItemComponent } from '../components/MenuComponent';
import { ThemeContext, Themes } from '../components/ThemeContext';
import { UserContext, User } from '../components/UserContext';
import { LocaleContext, Locales } from '../components/LocaleContext';
import '../components/App.scss';
import '../components/HeaderMenuComponent.scss';
import '../../node_modules/@fortawesome/free-solid-svg-icons/'

const icons = {
    none: '\u0020',
    uas: '\uf03d',              // fa-video
    channels: '\uf0cb',         // fa-list-ol
    devices: '\uf26c',          // fa-tv
    creative: '\uf1fc',         // fa-paint-brush
    harvesting: '\uf565',       // fa-crop-alt
    metadata: '\uf0ca',         // fa-list-ul
    approval: '\uf0ae',         // fa-tasks
    reports: '\uf080',          // fa-chart-bar
    dashboard: '\uf3fd',        // fa-tachometer-alt
    kpis: '\uf084',             // fa-key
    milestones: '\uf140',       // fa-bullseye
};

const creativeMenu = new Menu('creative', { defaultActive: 'creative_uas', subMenu: [
    new Menu('creative_uas', { title: 'menus.creative.uas', icon: icons.creative, subMenu: [
        new Menu('creative_uas_import', { title: 'menus.creative.import', icon: icons.uas, selectProps: 'page', url: '/iframe.html/creative/import' }),
        new Menu('creative_uas_adHarvesting', { title: 'menus.creative.harvesting', icon: icons.harvesting, selectProps: 'page', url: '/iframe.html/creative/harvesting' }),
        new Menu('creative_uas_metadataQueue', { title: 'menus.creative.metadata', icon: icons.metadata, selectProps: 'page', url: '/iframe.html/creative/metadata' }),
        new Menu('creative_uas_approvalQueue', { title: 'menus.creative.approval', icon: icons.approval, selectProps: 'page', url: '/iframe.html/creative/approval' })
    ]})
]});

const reportingMenu = new Menu('reporting', { defaultActive: 'internal', subMenu: [
    new Menu('reporting_internal', { title: 'menus.reporting.internal', icon: icons.reports, subMenu: [
        new Menu('reporting_internal_dashboard', { title: 'menus.reporting.dashboard', icon: icons.dashboard, selectProps: 'page' }),
        new Menu('reporting_internal_kpis', { title: 'menus.reporting.kpis', icon: icons.kpis, selectProps: 'page' }),
        new Menu('reporting_internal_milestones', { title: 'menus.reporting.milestones', icon: icons.milestones, selectProps: 'page' })
    ]}),
    new Menu('reporting_device-partner', { title: 'menus.reporting.devicePartner', icon: icons.reports, subMenu: [
        new Menu('reporting_device-partner_dashboard', { title: 'menus.reporting.dashboard', icon: icons.dashboard, selectProps: 'page' }),
        new Menu('reporting_device-partner_kpis', { title: 'menus.reporting.kpis', icon: icons.kpis, selectProps: 'page' }),
        new Menu('reporting_device-partner_milestones', { title: 'menus.reporting.milestones', icon: icons.milestones, selectProps: 'page' })
    ]}),
]});

const adminMenu = new Menu('admin', { subMenu: [
    new Menu('admin_devices', { title: 'menus.headers.devices', icon: icons.devices, selectProps: 'page' }),
    new Menu('admin_channels', { title: 'menus.headers.channels', icon: icons.channels, selectProps: 'page' }),
    new Menu('admin_uas', { title: 'menus.creative.uas', icon: icons.uas, selectProps: 'page' })
]});

const menu = new Menu('main', { subMenu: [
    new Menu('creative', { title: 'menus.headers.creative', selectProps: 'header' }),
    new Menu('reporting', { title: 'menus.headers.reporting', selectProps: 'header' }),
    new Menu('channels', { title: 'menus.headers.channels', selectProps: ['header', 'page'] }),
    new Menu('devices', { title: 'menus.headers.devices', selectProps: ['header', 'page'] }),
    new Menu('admin', { title: 'menus.headers.admin', selectProps: 'header' })
]});

const sideMenu = [
    creativeMenu,
    reportingMenu,
    adminMenu
];

const profileMenu = new Menu('profile', { subMenu: [
    new Menu('toggle_locale', { title: 'menus.profile.language', icon: '\uf0d9', subMenu: [
        new Menu('en-GB', { title: 'menus.profile.en_GB', icon: 'GB', selectProps: 'locale', selectable: true }),
        new Menu('dt-DT', { title: 'menus.profile.dt_DT', icon: 'DT', selectProps: 'locale', selectable: true }),
    ]}),
    new Menu('toggle_theme', { title: 'menus.profile.theme', icon: '\uf0d9', subMenu: [
        new Menu('light', { title: 'menus.profile.light', icon: '\uf185', selectProps: 'theme', selectable: true }),
        new Menu('dark', { title: 'menus.profile.dark', icon: '\uf186', selectProps: 'theme', selectable: true }),
    ]}),
    new Separator(),
    new Menu('logout', { title: 'menus.profile.logout', icon: '\uf2f5' }),
]});

const store = new Store({
    menu,
    // defaultMenuId: 'creative',
    selections: {
        header: 'creative',
        theme: 'light',
        locale: 'en-GB'
    },
    disabled: { reporting_internal_kpis: true },
    initiallyOpen: {
        'creative_uas': true,
        'reporting_internal': true,
        // 'reporting_device-partner': true
    },
    lastSelection: {},
    sideMenu,
    forceHideSideMenu: false,
    profileMenu,
    profileMenuOpen: false,
    user: User
});

const setMenu = (id) => {
    store.set({
        selections: {
            ...store.get('selections'),
            header: id
        },
        forceHideSideMenu: false
    });
};

// Set the default menu.
if (store.get('selections').header) {
    setMenu(store.get('selections').header);
}

const handleHeaderMenuClick = (menuItem) => {
    setMenu(menuItem.id);

    console.log(`Clicked ${menuItem.id}`);

    const selectPropsObj = menuItem.getSelectPropObject();
    if (selectPropsObj) {
        store.set({
            selections: {
                ...store.get('selections'),
                ...selectPropsObj
            }
        });
    }

    return true;
}

const handleSideMenuClick = (menuItem) => {
    const currentSideMenuId = store.get('selections').header;

    store.set({
        lastSelection: {
            ...store.get('lastSelection'),
            [currentSideMenuId]: menuItem.id
        }
    });

    const selectPropsObj = menuItem.getSelectPropObject();
    if (selectPropsObj) {
        store.set({
            selections: {
                ...store.get('selections'),
                ...selectPropsObj
            }
        });
    }

    console.log(`Side clicked ${menuItem.id}`);
    return true;
}

const handleProfileMenuClick = (menuItem) => {
    switch (menuItem.id) {
        case 'profile':
            if (!store.get('user')) {
                store.set({ user: User });
            } else {
                store.set({ profileMenuOpen: !store.get('profileMenuOpen') });
            }
            break;

        case 'logout':
            store.set({ user: null })
            store.set({ profileMenuOpen: false });
            break;

        default:
            console.log(`Profile menu clicked ${menuItem.id}`);
            break;
    }

    const selectPropsObj = menuItem.getSelectPropObject();
    if (selectPropsObj) {
        store.set({
            selections: {
                ...store.get('selections'),
                ...selectPropsObj
            }
        });
    }

    return true;
}

function RenderSideMenuForMeasurement({ sideBarRef, props }) {
    return (
        <div
            className='side-menu'
            style={{
                visibility: 'collapse',
                position: 'absolute'
            }}
        >
            <div
                ref={sideBarRef}
                className='side-menu-container'
            >
                {
                    props.sideMenu.map(menu => (
                        <MenuComponent
                            key={menu.id}
                            menu={menu}
                            isVisible={false}
                            selections={props.selections}
                            disabled={props.disabled}
                            initiallyOpen={props.initiallyOpen}
                            handleClick={() => {}}
                        />
                    ))
                }
                <button className='close-button'>
                    <FontAwesomeIcon className='icon' icon={faAngleDoubleLeft} />
                </button>
            </div>
        </div>
    );
}

function RenderSideMenu({ hideSideMenu, props, width }) {
    return (
        <div
            className={classNames(
                'side-menu',
                hideSideMenu && 'hide'
            )}
            style={{
                maxWidth: hideSideMenu ? 0 : width
            }}
        >
            <div
                className='side-menu-container'
                style={{ width }}
            >
                {
                    props.sideMenu.map(menu => (
                        <MenuComponent
                            key={menu.id}
                            menu={menu}
                            isVisible={menu.id === props.selections.header}
                            selections={props.selections}
                            disabled={props.disabled}
                            initiallyOpen={props.initiallyOpen}
                            handleClick={handleSideMenuClick}
                        />
                    ))
                }
                <button
                    className='close-button'
                    onClick={() => store.set({ forceHideSideMenu: true })}
                >
                    <FontAwesomeIcon
                        className='icon'
                        icon={faAngleDoubleLeft}
                    />
                </button>
            </div>
        </div>
    );
}

function MainMenu(props) {
    const theme = Themes[props.selections['theme']];
    const locale = Locales[props.selections['locale']];
    const { translations } = locale;

    const sideBarRef = useRef(null);
    const { width } = useComponentSize(sideBarRef);

    const hideSideMenu = props.forceHideSideMenu || !sideMenu.find(menuItem => menuItem.id === props.selections.header);

    return (
        <Router>
            <LocaleContext.Provider value={locale}>
                <ThemeContext.Provider value={theme}>
                    <UserContext.Provider value={props.user}>
                        <div
                            className={classNames('app', theme.className)}
                            style={{
                                backgroundColor: theme.color.background
                            }}>
                            <div className='header'>
                                <img className='logo' src='n-tab.png' alt='Nielsen logo' />
                                <div className='top-menu'>
                                    <MenuComponent
                                        menu={props.menu}
                                        selections={props.selections}
                                        disabled={props.disabled}
                                        initiallyOpen={props.initiallyOpen}
                                        handleClick={handleHeaderMenuClick}
                                    />
                                </div>
                                <div className='profile'>
                                </div>
                                <div className='profile'>
                                    <ProfileItemComponent
                                        menu={props.profileMenu}
                                        handleClick={handleProfileMenuClick}
                                    >
                                        <div
                                            className={classNames('profile-menu', props.profileMenuOpen && 'open')}
                                        >
                                            <MenuComponent
                                                menu={props.profileMenu}
                                                selections={props.selections}
                                                disabled={props.disabled}
                                                initiallyOpen={props.initiallyOpen}
                                                handleClick={handleProfileMenuClick}
                                            />
                                        </div>
                                    </ProfileItemComponent>
                                </div>
                            </div>

                            { RenderSideMenuForMeasurement({ sideBarRef, props } )}
                            { RenderSideMenu({ hideSideMenu, props, width })}

                            <div
                                className='body'
                            >
                                <p>{translations.bodyContent}</p>
                            </div>
                            <div className='footer'>
                                <p>{translations.copyright}</p>
                            </div>
                        </div>
                    </UserContext.Provider>
                </ThemeContext.Provider>
            </LocaleContext.Provider>
        </Router>
    );
}

storiesOf('MenuComponent', module)
    // .add('default', () => {
    //     return (
    //         <State store={store}>
    //             {
    //                 state => (
    //                     <Router>
    //                         <LocaleContext.Provider value={state.locale}>
    //                             <ThemeContext.Provider value={state.theme}>
    //                                 <UserContext.Provider value={state.user}>
    //                                     <MenuComponent
    //                                         {...state}
    //                                         handleClick={handleClick}
    //                                     />
    //                                 </UserContext.Provider>
    //                             </ThemeContext.Provider>
    //                         </LocaleContext.Provider>
    //                     </Router>
    //                 )
    //             }
    //         </State>
    //     );
    // })
    .add('header menu', () => {
        return (
            <State store={store}>
                { state => <MainMenu {...state} /> }
            </State>
        );
    });
