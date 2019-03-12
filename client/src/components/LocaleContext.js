import React from 'react';

const englishGB = 'en-GB';
const german = 'dt-DT';

export const Translations = {
    [englishGB]: {
        menus: {
            headers: {
                creative: 'Creative',
                reporting: 'Reporting',
                channels: 'Channels',
                devices: 'Devices',
                admin: 'Admin'
            },
            creative: {
                uas: 'Underlying Ads',
                import: 'Import',
                harvesting: 'Ad Harvesting',
                metadata: 'Metadata Queue',
                approval: 'Approval Queue'
            },
            reporting: {
                internal: 'Internal',
                devicePartner: 'Device Partner',
                inventoryPartner: 'Inventory Partner',
                exchange: 'Exchange',
                dashboard: 'Dashboard',
                kpis: 'KPIs',
                milestones: 'Milestones',
                simple: 'Simple'
            }
        },
        copyright: '© Copyright 2019, Nielsen Media Inc, All Rights Reserved.'
    },
    [german]: {
        menus: {
            headers: {
                creative: 'Kreativ',
                reporting: 'Berichterstattung',
                channels: 'Channels',
                devices: 'Geräte',
                admin: 'Administrator'
            },
            creative: {
                uas: 'Zugrunde liegende Anzeigen',
                import: 'Einführen',
                harvesting: 'Anzeigenernte',
                metadata: 'Metadaten-Warteschlange',
                approval: 'Genehmigungswarteschlange'
            },
            reporting: {
                internal: 'Intern',
                devicePartner: 'Gerätepartner',
                inventoryPartner: 'Inventar-Partner',
                exchange: 'Austausch',
                dashboard: 'Instrumententafel',
                kpis: 'Leistungsindikatoren',
                milestones: 'Meilensteine',
                simple: 'Einfach'
            }
        },
        copyright: '© Copyright 2019, Nielsen Media Inc., Alle Rechte vorbehalten.'
    }
};

export const Formatters = {
    [englishGB]: {
        formatNumber: () => {}
    },
    [german]: {
        formatNumber: () => {}
    }
};

export const Locales = {
    [englishGB]: {
        translations: Translations[englishGB],
        formatters: Formatters[englishGB]
    },
    [german]: {
        translations: Translations[german],
        formatters: Formatters[german]
    }
};

export const LocaleContext = React.createContext(Locales[englishGB]);
