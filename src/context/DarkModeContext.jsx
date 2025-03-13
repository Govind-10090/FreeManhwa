import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const DarkModeContext = createContext();

const STORAGE_KEY = 'darkMode';
const TRANSITION_CLASS = 'no-transition';

export function DarkModeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem(STORAGE_KEY);
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    // Memoize the system preference media query
    const systemPreference = useMemo(
        () => window.matchMedia('(prefers-color-scheme: dark)'),
        []
    );

    // Handle theme change with transition
    const applyTheme = useCallback((dark) => {
        const root = document.documentElement;
        
        // Disable transitions temporarily
        root.classList.add(TRANSITION_CLASS);
        
        if (dark) {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#1a1a1a';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#ffffff';
        }

        // Re-enable transitions after a short delay
        requestAnimationFrame(() => {
            root.classList.remove(TRANSITION_CLASS);
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dark));
    }, []);

    // Handle system preference changes
    useEffect(() => {
        const handleChange = (e) => {
            if (localStorage.getItem(STORAGE_KEY) === null) {
                setIsDarkMode(e.matches);
            }
        };

        systemPreference.addEventListener('change', handleChange);
        return () => systemPreference.removeEventListener('change', handleChange);
    }, [systemPreference]);

    // Apply theme changes
    useEffect(() => {
        applyTheme(isDarkMode);
    }, [isDarkMode, applyTheme]);

    // Toggle with debounce to prevent rapid changes
    const toggleDarkMode = useCallback(() => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setIsDarkMode(prev => !prev);
            
            // Prevent multiple toggles within 300ms
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }
    }, [isTransitioning]);

    // Memoize context value to prevent unnecessary rerenders
    const value = useMemo(
        () => ({ isDarkMode, toggleDarkMode }),
        [isDarkMode, toggleDarkMode]
    );

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
} 