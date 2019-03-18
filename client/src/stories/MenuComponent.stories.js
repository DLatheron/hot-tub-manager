import React, { useRef, useState, useEffect } from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';
import { BrowserRouter as Router } from "react-router-dom";
import classNames from 'classnames';

import MenuComponent, { Menu, Separator, ProfileItemComponent } from '../components/MenuComponent';
import { ThemeContext, Themes } from '../components/ThemeContext';
import { UserContext, User } from '../components/UserContext';
import { LocaleContext, Locales } from '../components/LocaleContext';
import '../components/App.scss';
import '../components/HeaderMenuComponent.scss';
import '../../node_modules/@fortawesome/free-solid-svg-icons/'

const creativeMenu = new Menu('creative', { subMenu: [
    new Menu('creative_uas', { title: 'menus.creative.uas', subMenu: [
        new Menu('creative_uas_import', { title: 'menus.creative.import', url: '/iframe.html/creative/import' }),
        new Menu('creative_uas_adHarvesting', { title: 'menus.creative.harvesting', url: '/iframe.html/creative/harvesting' }),
        new Menu('creative_uas_metadataQueue', { title: 'menus.creative.metadata', url: '/iframe.html/creative/metadata' }),
        new Menu('creative_uas_approvalQueue', { title: 'menus.creative.approval', url: '/iframe.html/creative/approval' })
    ]})
]});

const reportingMenu = new Menu('reporting', { subMenu: [
    new Menu('internal', { title: 'menus.reporting.internal', subMenu: [
        new Menu('reporting_internal_dashboard', { title: 'menus.reporting.dashboard' }),
        new Menu('reporting_internal_kpis', { title: 'menus.reporting.kpis' }),
        new Menu('reporting_internal_milestones', { title: 'menus.reporting.milestones' })
    ]}),
    new Menu('device-partner', { title: 'menus.reporting.devicePartner', subMenu: [
        new Menu('reporting_device-partner_dashboard', { title: 'menus.reporting.dashboard' }),
        new Menu('reporting_device-partner_kpis', { title: 'menus.reporting.kpis' }),
        new Menu('reporting_device-partner_milestones', { title: 'menus.reporting.milestones' })
    ]}),
]});

const adminMenu = new Menu('admin', { subMenu: [
    new Menu('admin_devices', { title: 'menus.headers.devices' }),
    new Menu('admin_channels', { title: 'menus.headers.channels' }),
    new Menu('admin_uas', { title: 'menus.creative.uas' })
]});

const menu = new Menu('main', { subMenu: [
    new Menu('creative', { title: 'menus.headers.creative' }),
    new Menu('reporting', { title: 'menus.headers.reporting' }),
    new Menu('channels', { title: 'menus.headers.channels' }),
    new Menu('devices', { title: 'menus.headers.devices' }),
    new Menu('admin', { title: 'menus.headers.admin' })
]});

const sideMenu = [
    creativeMenu,
    reportingMenu,
    adminMenu
];

const profileMenu = new Menu('profile', { subMenu: [
    new Menu('toggle_locale', { title: 'menus.profile.language', icon: '\uf0d9', subMenu: [
        new Menu('en-GB', { title: 'menus.profile.en_GB', icon: 'GB', selectable: true }),
        new Menu('dt-DT', { title: 'menus.profile.dt_DT', icon: 'DT', selectable: true }),
    ]}),
    new Menu('toggle_theme', { title: 'menus.profile.theme', icon: '\uf0d9', subMenu: [
        new Menu('theme-light', { title: 'menus.profile.light', icon: '\uf185', selectable: true }),
        new Menu('theme-dark', { title: 'menus.profile.dark', icon: '\uf186', selectable: true }),
    ]}),
    new Separator(),
    new Menu('logout', { title: 'menus.profile.logout', icon: '\uf2f5' }),
]});

const store = new Store({
    menu,
    sideMenu,
    hideSideMenu: false,
    profileMenu,
    profileMenuOpen: false,
    user: User,
    theme: Themes.dark,
    locale: Locales['dt-DT']
});

profileMenu.setSelected(store.get('locale').countryCode, true);
profileMenu.setSelected(store.get('theme').className, true);

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

        case 'theme-light':
            console.log('Theme = light');

            profileMenu.setSelected('theme-dark', false);
            profileMenu.setSelected('theme-light', true);

            store.set({ profileMenu });
            store.set({ theme: Themes.light });
            // store.set({ profileMenuOpen: false });
            break;

        case 'theme-dark':
            console.log('Theme = dark');

            profileMenu.setSelected('theme-light', false);
            profileMenu.setSelected('theme-dark', true);

            store.set({ profileMenu });
            store.set({ theme: Themes.dark });
            // store.set({ profileMenuOpen: false });
            break;

        case 'en-GB':
        case 'dt-DT':
            console.log(`Locale = ${menuItem.id}`);

            const currentLocale = store.get('locale').countryCode;
            const newLocale = menuItem.id;

            profileMenu.setSelected(currentLocale, false);
            profileMenu.setSelected(newLocale, true);

            store.set({ profileMenu });
            store.set({ locale: Locales[menuItem.id] });
            // store.set({ profileMenuOpen: false });
            break;

        default:
            // Force refresh.
            store.set({ profileMenu });

            console.log(`Profile menu clicked ${menuItem.id}`);
            break;
    }

    return true;
}

function MainMenu(props) {
    const { translations } = props.locale;

    const sideBarRef = useRef(null);

    // HACK: To ensure we capture the width of the side panel exactly once, and only
    //       set the style - once we have it set.
    let [maxSideMenuWidth, setMaxSideMenuWidth] = useState();
    const [lastLocale, setLastLocale] = useState(props.locale);

    useEffect(() => {
        if (maxSideMenuWidth !== sideBarRef.current.clientWidth) {
            setMaxSideMenuWidth(sideBarRef.current.clientWidth);
        }
    });

    if (lastLocale !== props.locale) {
        setMaxSideMenuWidth(undefined);
        setLastLocale(props.locale);
    }

    const style = { maxWidth: props.hideSideMenu ? 0 : maxSideMenuWidth };
    const subStyle = { width: maxSideMenuWidth };

    return (
        <Router>
            <LocaleContext.Provider value={props.locale}>
                <ThemeContext.Provider value={props.theme}>
                    <UserContext.Provider value={props.user}>
                        <div
                            className={classNames('app', props.theme.className)}
                            style={{
                                backgroundColor: props.theme.color.background
                            }}>
                            <div className='header'>
                                <img className='logo' src='n-tab.png' alt='Nielsen logo' />
                                <div className='top-menu'>
                                    <MenuComponent
                                        menu={props.menu}
                                        handleClick={handleClick}
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
                                                handleClick={handleProfileMenuClick}
                                            />
                                        </div>
                                    </ProfileItemComponent>
                                </div>
                            </div>

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
                                                handleClick={handleSideMenuClick}
                                            />
                                        ))
                                    }
                                </div>
                            </div>

                            <div
                                className={classNames('side-menu', props.hideSideMenu && 'hide')}
                                style={style}
                            >
                                <div
                                    className='side-menu-container'
                                    style={subStyle}
                                >
                                    {
                                        props.sideMenu.map(menu => (
                                            <MenuComponent
                                                key={menu.id}
                                                menu={menu}
                                                handleClick={handleSideMenuClick}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
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
