import React from 'react';

export const Themes = {
    light: {
        className: 'theme-light',
        color: {
            background: 'white',
            backgroundHilight: '#e6e6e6',
            text: 'black',

            menuIconBackground: 'f0f0f0',
            menuIconBackgroundHilight: '#d7d7d7'
        }
    },
    dark: {
        className: 'theme-dark',
        color: {
            background: '#333',
            backgroundHilight: '#595959',
            text: 'white',

            menuIconBackground: '303030',
            menuIconBackgroundHilight: '#565656'
        }
    }
};

export const ThemeContext = React.createContext(Themes.light);
