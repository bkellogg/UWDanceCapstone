import React from 'react';
import ReactDOM from 'react-dom';
import './styling/index.css';
import App from './App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render(
    <MuiThemeProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById('root'));
registerServiceWorker();
