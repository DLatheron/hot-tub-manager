import React from 'react';

export const Themes = {
    light: {
        className: 'theme-light',
        color: {
            background: 'white',
            text: 'black',
        }
    },
    dark: {
        className: 'theme-dark',
        color: {
            background: '#333',
            text: 'white',
        }
    }
};

export const ThemeContext = React.createContext(Themes.light);
