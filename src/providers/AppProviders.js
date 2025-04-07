import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { DarkModeProvider } from '../context/DarkModeContext';
import { FavoritesProvider } from '../context/FavoritesContext';

function AppProviders({ children }) {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <DarkModeProvider>
                <FavoritesProvider>
                    {children}
                </FavoritesProvider>
            </DarkModeProvider>
        </Router>
    );
}

export default AppProviders; 