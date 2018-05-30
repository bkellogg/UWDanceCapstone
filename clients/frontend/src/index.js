import React from 'react';
import ReactDOM from 'react-dom';
import './styling/index.css';
import App from './App';
import ScrollToTop from './ScrollToTop';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { BrowserRouter, Route } from 'react-router-dom';

const muiTheme = getMuiTheme({
    stepper: {
        iconColor: '#22A7E0' // or logic to change color
    }
})

ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
        <BrowserRouter >
            <ScrollToTop>
                <App />
            </ScrollToTop>
        </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById('root'));