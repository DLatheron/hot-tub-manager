import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';
import { BrowserRouter as Router } from "react-router-dom";

import MenuComponent, { Menu, ProfileItemComponent } from '../components/MenuComponent';
import { ThemeContext, Themes } from '../components/ThemeContext';
import { UserContext, User } from '../components/UserContext';
import { LocaleContext, Locales } from '../components/LocaleContext';
import '../components/App.scss';
// import '../components/MenuComponent.scss';
import '../components/HeaderMenuComponent.scss';
import '../../node_modules/@fortawesome/free-solid-svg-icons/'

const creativeMenu = new Menu('creative', { classes: ['menu'], subMenu: [
    new Menu('creative_uas', { title: 'Underlying Ads', subMenu: [
        new Menu('creative_uas_import', { title: 'Import', url: '/iframe.html/creative/import' }),
        new Menu('creative_uas_adHarvesting', { title: 'Ad Harvesting', url: '/iframe.html/creative/harvesting' }),
        new Menu('creative_uas_metadataQueue', { title: 'Metadata Queue', url: '/iframe.html/creative/metadata' }),
        new Menu('creative_uas_approvalQueue', { title: 'Approval Queue', url: '/iframe.html/creative/approval' })
    ]})
]});

const reportingMenu = new Menu('reporting', { classes: ['menu'], subMenu: [
    new Menu('internal', { title: 'Internal', classes: [], subMenu: [
        new Menu('reporting_internal_dashboard', { title: 'Dashboard' }),
        new Menu('reporting_internal_kpis', { title: 'KPIs' }),
        new Menu('reporting_internal_milestones', { title: 'Milestones' })
    ]}),
    new Menu('device-partner', { title: 'Device Partner', classes: [], subMenu: [
        new Menu('reporting_device-partner_dashboard', { title: 'Dashboard' }),
        new Menu('reporting_device-partner_kpis', { title: 'KPIs' }),
        new Menu('reporting_device-partner_milestones', { title: 'Milestones' })
    ]}),
]});

const adminMenu = new Menu('admin', { classes: ['menu'], subMenu: [
    new Menu('admin_devices', { title: 'Devices' }),
    new Menu('admin_channels', { title: 'Channels' }),
    new Menu('admin_uas', { title: 'Underlying Ads' })
]});

const menu = new Menu('main', { classes: ['menu'], subMenu: [
    new Menu('creative', { title: 'Creative', classes: [] }),
    new Menu('reporting', { title: 'Reporting', classes: [] }),
    new Menu('channels', { title: 'Channels', classes: [] }),
    new Menu('devices', { title: 'Devices', classes: [] }),
    new Menu('admin', { title: 'Admin', classes: [] })
]});

const sideMenu = [
    creativeMenu,
    reportingMenu,
    adminMenu
];

const profileMenu = new Menu('profile', { classes: ['menu' ], subMenu: [
    new Menu('toggle_locale', { title: 'Locale', icon: '\uf0d9', subMenu: [
        new Menu('en_GB', { title: 'English', icon: 'GB' }),
        new Menu('dt_DT', { title: 'German', icon: 'DT' }),
    ]}),
    new Menu('toggle_theme', { title: 'Theme', icon: '\uf0d9', subMenu: [
        new Menu('theme_light', { title: 'Light', icon: '\uf185' }),
        new Menu('theme_dark', { title: 'Dark', icon: '\uf186' }),
    ]}),
    new Menu('separator', { title: '', classes: ['separator'] }),
    new Menu('logout', { title: 'Logout', icon: '\uf2f5' }),
]});

const store = new Store({
    menu,
    sideMenu,
    hideSideMenu: false,
    profileMenu,
    user: User,
    theme: Themes.light,
    locale: Locales['en-GB']
});

const handleClick = (menuItem) => {
    menu.setActiveItem(menuItem.id);
    sideMenu.forEach(menu => menu.setActiveItem(menuItem.id));

    // Force refresh.
    store.set({ menu });
    store.set({ sideMenu });

    const noMenu = sideMenu.every(menu => !menu.active);
    store.set({ hideSideMenu: noMenu });

    console.log(`Clicked ${menuItem.id}`);
    return true;
}

const handleSideMenuClick = (menuItem) => {
    sideMenu.forEach(menu => menu.setActiveItem(menuItem.id));

    // Force refresh.
    store.set({ sideMenu });

    console.log(`Side clicked ${menuItem.id}`);
    return true;
}

const handleProfileMenuClick = (menuItem) => {
    // Force refresh.
    store.set({ profileMenu });

    console.log(`Profile menu clicked ${menuItem.id}`);
    return true;
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
        const sideBarRef = React.createRef();
        let maxSideMenuWidth;

        return (
            <State store={store}>
                {
                    state => {
                        // HACK: To ensure we capture the width of the side panel exactly once, and only
                        //       set the style - once we have it set.
                        if (sideBarRef.current && maxSideMenuWidth === undefined) {
                            maxSideMenuWidth = sideBarRef.current.clientWidth;
                        }

                        const style = {};
                        const subStyle = {};

                        if (maxSideMenuWidth !== undefined) {
                            style.width = `${maxSideMenuWidth}px`;
                            style.maxWidth = state.hideSideMenu ? 0 : `${maxSideMenuWidth}px`;

                            subStyle.width = `${maxSideMenuWidth}px`;
                        }

                        return (
                            <Router>
                                <LocaleContext.Provider value={state.locale}>
                                    <ThemeContext.Provider value={state.theme}>
                                        <UserContext.Provider value={state.user}>
                                            <div className='app'>
                                                <div className='header'>
                                                    <img className='logo' src='n-tab.png' alt='Nielsen logo' />
                                                    <div className='top-menu'>
                                                        <MenuComponent
                                                            menu={state.menu}
                                                            handleClick={handleClick}
                                                        />
                                                    </div>
                                                    <div className='profile'>
                                                    </div>
                                                    <div className='profile'>
                                                        <ProfileItemComponent
                                                            menu={state.profileMenu}
                                                            handleClick={handleProfileMenuClick}
                                                        >
                                                            <div className='profile-menu'>
                                                                <MenuComponent
                                                                    menu={state.profileMenu}
                                                                    handleClick={handleProfileMenuClick}
                                                                />
                                                            </div>
                                                        </ProfileItemComponent>
                                                    </div>
                                                </div>
                                                <div
                                                    className='side-menu'
                                                    style={style}
                                                >
                                                    <div
                                                        ref={sideBarRef}
                                                        className='side-menu-container'
                                                        style={subStyle}
                                                    >
                                                        {
                                                            state.sideMenu.map(menu => (
                                                                <MenuComponent
                                                                    menu={menu}
                                                                    handleClick={handleSideMenuClick}
                                                                />
                                                            ))
                                                        }
                                                    </div>
                                                </div>

                                                {/* <div className='side-menu'>
                                                </div> */}
                                                {/* <ul className='side-menu'>
                                                    <li>Hello</li>
                                                </ul> */}
                                                {/* <ul className='menu top-bar header-menu'>
                                                    <li>Goodbye</li>
                                                </ul> */}
                                                <div className='body'>
                                                    <p>Body content goes here.</p>
                                                </div>
                                                <div className='footer'>
                                                    <p>Copyright message goes here...</p>
                                                </div>
                                            </div>
                                        </UserContext.Provider>
                                    </ThemeContext.Provider>
                                </LocaleContext.Provider>
                            </Router>
                        );
                    }
                }
            </State>
        );
    });
