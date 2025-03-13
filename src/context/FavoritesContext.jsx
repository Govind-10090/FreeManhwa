import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (manhwa) => {
        const newFavorite = {
            id: manhwa.id,
            title: manhwa.title,
            coverUrl: manhwa.coverUrl,
            rating: manhwa.rating,
            status: manhwa.status,
            addedAt: new Date().toISOString()
        };

        setFavorites(prev => {
            if (!prev.some(item => item.id === manhwa.id)) {
                return [...prev, newFavorite];
            }
            return prev;
        });
    };

    const removeFavorite = (manhwaId) => {
        setFavorites(prev => prev.filter(item => item.id !== manhwaId));
    };

    const isFavorite = (manhwaId) => {
        return favorites.some(item => item.id === manhwaId);
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            addFavorite,
            removeFavorite,
            isFavorite
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
} 