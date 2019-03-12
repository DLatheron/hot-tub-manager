import React from 'react';

export const Themes = {
    light: {
        backgroundColor: 'white',
        textColor: 'black',
    },
    dark: {
        backgroundColor: '#333',
        textColor: 'white'
    }
};

export const ThemeContext = React.createContext(Themes.light);
