import React from 'react';

import scssTheme from './Themes.scss';

export const Themes = {
    light: {
        className: 'theme-light',
        color: {
            background: scssTheme.lightTheme_BackgroundColor,
            text: scssTheme.lightTheme_TextColor,
        }
    },
    dark: {
        className: 'theme-dark',
        color: {
            background: scssTheme.darkTheme_BackgroundColor,
            text: scssTheme.darkTheme_TextColor,
        }
    }
};

export const ThemeContext = React.createContext(Themes.light);
