import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';
import { BrowserRouter as Router } from "react-router-dom";

import MenuComponent, { Menu } from '../components/MenuComponent';
import { ThemeContext, Themes } from '../components/ThemeContext';
import { UserContext, User } from '../components/UserContext';
import { LocaleContext, Locales } from '../components/LocaleContext';
import '../components/App.scss';
// import '../components/MenuComponent.scss';
import '../components/HeaderMenuComponent.scss';

const creativeMenu = new Menu('creative', { title: 'Creative', classes: ['menu', 'header-menu', 'side'], subMenu: [
    new Menu('creative_uas', { title: 'Underlying Ads', subMenu: [
        new Menu('creative_uas_import', { title: 'Import', url: '/iframe.html/creative/import' }),
        new Menu('creative_uas_adHarvesting', { title: 'Ad Harvesting', url: '/iframe.html/creative/harvesting' }),
        new Menu('creative_uas_metadataQueue', { title: 'Metadata Queue', url: '/iframe.html/creative/metadata' }),
        new Menu('creative_uas_approvalQueue', { title: 'Approval Queue', url: '/iframe.html/creative/approval' })
    ]})
]});

const reportingMenu = new Menu('reporting', { title: 'Reporting', classes: ['menu', 'header-menu', 'side'], subMenu: [
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

const menu = new Menu('main', { classes: ['menu', 'header-menu', 'header'], subMenu: [
    new Menu('creative', { title: 'Creative', subMenu: creativeMenu, classes: ['menu', 'header-menu', 'side'] }),
    new Menu('reporting', { title: 'Reporting', subMenu: reportingMenu, classes: ['menu', 'header-menu', 'side'] }),
    new Menu('channels', { title: 'Channels', classes: [] }),
    new Menu('devices', { title: 'Devices', classes: [] }),
    new Menu('admin', { title: 'Admin', classes: [] })
]});

const store = new Store({
    menu,
    user: User,
    theme: Themes.light,
    locale: Locales['en-GB']
});

const handleClick = (menuItem) => {
    menu.setActiveItem(menuItem.id);

    store.set('menu', menu);

    // console.log(`Clicked ${JSON.stringify(menuItem, null, 4)}`);
    console.log(`Clicked ${menuItem.id}`);
    return true;
}

storiesOf('MenuComponent', module)
    .add('default', () => {
        return (
            <State store={store}>
                {
                    state => (
                        <Router>
                            <LocaleContext.Provider value={state.locale}>
                                <ThemeContext.Provider value={state.theme}>
                                    <UserContext.Provider value={state.user}>
                                        <MenuComponent
                                            {...state}
                                            handleClick={handleClick}
                                        />
                                    </UserContext.Provider>
                                </ThemeContext.Provider>
                            </LocaleContext.Provider>
                        </Router>
                    )
                }
            </State>
        );
    })
    .add('header menu', () => {
        return (
            <State store={store}>
                {
                    state => (
                        <Router>
                            <LocaleContext.Provider value={state.locale}>
                                <ThemeContext.Provider value={state.theme}>
                                    <UserContext.Provider value={state.user}>
                                        <div className='app'>
                                            <img className='logo' src='n-tab.png' alt='Nielsen logo' />
                                            <MenuComponent
                                                {...state}
                                                handleClick={handleClick}
                                            />
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
                    )
                }
            </State>
        );
    });
