import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import MainPage, { Menu } from '../components/MainPage';
import { ThemeContext, Themes } from '../components/ThemeContext';
import { UserContext, User } from '../components/UserContext';
import '../components/MainPage.scss';

storiesOf('MainPage', module)
    .add('default', () => {
        const store = new Store({
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
            defaultMenu: ['reporting', 'reporting_internal_kpis'],
            profileMenu: new Menu('profile', 'Profile', [
                new Menu('settings', 'Settings'),
                new Menu('toggle-theme', 'Toggle Theme'),
                new Menu('logout', 'Logout')
            ]),
            user: User,
            theme: Themes.light
        });

        const handleSelection = (id) => {
            switch (id) {
                case 'login':
                    store.set({ user: User });
                    break;

                case 'logout':
                    store.set({ user: null })
                    break;

                case 'toggle-theme':
                console.log(`store.theme: ${store.theme}`);
                    store.set({ theme: store.get('theme') === Themes.dark ? Themes.light : Themes.dark });
                    break;

                default:
                    console(`Clicked ${id}`);
                    break;
            }
        };

        const LocaleContext = React.createContext();

        return (
            <State store={store}>
                {
                    state => (
                        <LocaleContext.Provider>
                            <ThemeContext.Provider value={state.theme}>
                                <UserContext.Provider value={state.user}>
                                    <MainPage
                                        {...state}
                                        handleSelection={handleSelection}
                                    >
                                    </MainPage>
                                </UserContext.Provider>
                            </ThemeContext.Provider>
                        </LocaleContext.Provider>
                    )
                }
            </State>
        );
    });
