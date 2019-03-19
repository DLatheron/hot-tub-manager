// import React from 'react';
// import { State, Store } from '@sambego/storybook-state';
// import { storiesOf } from '@storybook/react';

// import MainPage, { Menu } from '../components/MainPage';
// import { ThemeContext, Themes } from '../components/ThemeContext';
// import { UserContext, User } from '../components/UserContext';
// import { LocaleContext, Locales } from '../components/LocaleContext';
// import '../components/MainPage.scss';

// storiesOf('MainPage', module)
//     .add('default', () => {
//         const store = new Store({
//             menu: new Menu('main', '', [
//                 new Menu('creative', 'menus.headers.creative', [
//                     new Menu('uas', 'menus.creative.uas', [
//                         new Menu('creative_uas_import', 'menus.creative.import', null, null, '/iframe.html/creative/import'),
//                         new Menu('creative_uas_adHarvesting', 'menus.creative.harvesting', null, null, '/iframe.html/creative/harvesting'),
//                         new Menu('creative_uas_metadataQueue', 'menus.creative.metadata', null, null, '/iframe.html/creative/metadata'),
//                         new Menu('creative_uas_approvalQueue', 'menus.creative.approval', null, null, '/iframe.html/creative/approval')
//                     ])
//                 ], 'creative_uas_import'),
//                 new Menu('reporting', 'menus.headers.reporting', [
//                     new Menu('internal', 'menus.reporting.internal', [
//                         new Menu('reporting_internal_dashboard', 'menus.reporting.dashboard'),
//                         new Menu('reporting_internal_kpis', 'menus.reporting.kpis'),
//                         new Menu('reporting_internal_milestones', 'menus.reporting.milestones')
//                     ]),
//                     new Menu('device-partner', 'menus.reporting.devicePartner', [
//                         new Menu('reporting_device-partner_dashboard', 'menus.reporting.dashboard'),
//                         new Menu('reporting_device-partner_kpis', 'menus.reporting.kpis'),
//                         new Menu('reporting_device-partner_milestones', 'menus.reporting.milestones')
//                     ]),
//                     new Menu('inventory-parner', 'menus.reporting.inventoryPartner', [
//                         new Menu('reporting_inventory-partner_dashboard', 'menus.reporting.dashboard'),
//                         new Menu('reporting_inventory-partner_kpis', 'menus.reporting.kpis'),
//                         new Menu('reporting_inventory-partner_milestones', 'menus.reporting.milestones')
//                     ]),
//                     new Menu('exchange', 'menus.reporting.exchange', [
//                         new Menu('reporting_exchange_dashboard', 'menus.reporting.dashboard'),
//                         new Menu('reporting_exchange_kpis', 'menus.reporting.kpis'),
//                         new Menu('reporting_exchange_milestones', 'menus.reporting.milestones')
//                     ]),
//                     new Menu('simple', 'menus.reporting.simple')
//                 ], 'reporting_device-partner_dashboard'),
//                 new Menu('channels', 'menus.headers.channels', null, null, '/iframe.html/channels'),
//                 new Menu('devices', 'menus.headers.devices', null, null, '/iframe.html/devices'),
//                 new Menu('admin', 'menus.headers.admin', null, null, '/iframe.html/admin')
//             ]),
//             defaultMenu: ['reporting', 'reporting_internal_kpis'],
//             profileMenu: new Menu('profile', 'Profile', [
//                 new Menu('settings', 'Settings'),
//                 new Menu('toggle-locale', 'Toggle Locale'),
//                 new Menu('toggle-theme', 'Toggle Theme'),
//                 new Menu('logout', 'Logout')
//             ]),
//             user: User,
//             theme: Themes.light,
//             locale: Locales['en-GB']
//         });

//         const handleSelection = (id) => {
//             switch (id) {
//                 case '':
//                     // location = '/creative/stuff';
//                     break;

//                 case 'login':
//                     store.set({ user: User });
//                     break;

//                 case 'logout':
//                     store.set({ user: null })
//                     break;

//                 case 'toggle-theme':
//                     store.set({ theme: store.get('theme') === Themes.dark ? Themes.light : Themes.dark });
//                     break;

//                 case 'toggle-locale':
//                     store.set({ locale: store.get('locale') === Locales['en-GB'] ? Locales['dt-DT'] : Locales['en-GB']});
//                     break;

//                 default:
//                     console.log(`Clicked ${id}`);
//                     break;
//             }
//         };

//         return (
//             <State store={store}>
//                 {
//                     state => (
//                         <LocaleContext.Provider value={state.locale}>
//                             <ThemeContext.Provider value={state.theme}>
//                                 <UserContext.Provider value={state.user}>
//                                     <MainPage
//                                         {...state}
//                                         handleSelection={handleSelection}
//                                     >
//                                     </MainPage>
//                                 </UserContext.Provider>
//                             </ThemeContext.Provider>
//                         </LocaleContext.Provider>
//                     )
//                 }
//             </State>
//         );
//     });
