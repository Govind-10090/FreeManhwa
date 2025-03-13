import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AppProviders from './providers/AppProviders.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>
);
