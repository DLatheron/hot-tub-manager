import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import { storiesOf } from '@storybook/react';

// import  from '';

const themes = {
    light: {
        name: 'Light',
        foreground: '#000000',
        background: '#eeeeee'
    },
    dark: {
        name: 'Dark',
        foreground: '#ffffff',
        background: '#222222'
    }
};

const ThemeContext = React.createContext(themes.light);

class App extends React.Component {
    state = {
        theme: themes.light
    };

    toggleTheme = () => {
        this.setState(state => ({
            theme: state.theme === themes.dark
                ? themes.light
                : themes.dark
        }));
    }

    render() {
        return (
            <ThemeContext.Provider value={this.state.theme}>
                <ThemedContainer>
                    <ThemedButton onClick={this.toggleTheme} label='Toggle Theme' />
                    <br/>
                    <br/>
                    <p>This is some generic text that will change colour as the Theme changes.</p>
                    <br/>
                    <Toolbar />
                </ThemedContainer>
            </ThemeContext.Provider>
        );
    }
}

function Toolbar(props) {
    return (
        <div>
            <ThemedButton label='Hello World' />
        </div>
    )
}

class ThemedContainer extends React.Component {
    static contextType = ThemeContext;

    render() {
        const theme = this.context;

        return (
            <div
                style={{
                    width: '100%',
                    height: '100vh',
                    color: theme.foreground,
                    backgroundColor: theme.background,
                    outline: 'none',
                    border: 'none'
                }}
            >
                {this.props.children}
            </div>
        )
    }
}

class ThemedButton extends React.Component {
    static contextType = ThemeContext;

    render() {
        const theme = this.context;

        return (
            <button
                style={{
                    width: '100%',
                    height: 40,
                    color: theme.background,
                    backgroundColor: theme.foreground
                }}
                {...this.props}
            >
                <label>{this.props.label}</label>
            </button>
        );
    }
}


storiesOf('ThemeProvider', module)
    .add('default', () => {
        const store = new Store({});

        return (
            <State store={store}>
                {
                    state => (
                        <App />
                    )
                }
            </State>
        );
    });
