import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useDarkMode } from '../context/DarkModeContext';
import ManhuaCard from '../components/ManhuaCard';

export default function Favorites() {
    const { favorites, removeFavorite } = useFavorites();
    const { isDarkMode } = useDarkMode();

    const sortedFavorites = [...favorites].sort((a, b) => 
        new Date(b.addedAt) - new Date(a.addedAt)
    );

    return (
        <div className={`min-h-screen pt-20 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Favorite Manhwas</h1>

                {favorites.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg mb-2">No favorites yet</p>
                        <p className="text-sm text-gray-500">
                            Start adding manhwas to your favorites by clicking the heart icon on any manhwa card
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {sortedFavorites.map(manhwa => (
                            <div key={manhwa.id} className="relative group">
                                <ManhuaCard manga={manhwa} />
                                <button
                                    onClick={() => removeFavorite(manhwa.id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove from favorites"
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
