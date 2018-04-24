import React from 'react';
import ReactDOM from 'react-dom';
import './styling/index.css';
import App from './App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { BrowserRouter } from 'react-router-dom';

const muiTheme = getMuiTheme({
    stepper: {
        iconColor: '#22A7E0' // or logic to change color
    }
})

ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById('root'));
registerServiceWorker();
