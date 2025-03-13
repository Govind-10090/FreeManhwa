import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DarkModeProvider } from '../context/DarkModeContext';
import { FavoritesProvider } from '../context/FavoritesContext';

function AppProviders({ children }) {
    return (
        <Router>
            <DarkModeProvider>
                <FavoritesProvider>
                    {children}
                </FavoritesProvider>
            </DarkModeProvider>
        </Router>
    );
}

export default AppProviders; 