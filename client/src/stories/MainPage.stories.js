import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

import MainPage, { Menu } from '../components/MainPage';
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
            defaultMenu: ['reporting', 'reporting_internal_kpis']
        });

        return (
            <State store={store}>
                {
                    state => (
                        <MainPage {...state}>{}</MainPage>
                    )
                }
            </State>
        );
    });
