import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getCoverUrl } from '../utils/api';

export default function ManhuaCard({ manga }) {
    const { isDarkMode } = useDarkMode();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isInFavorites = isFavorite(manga.id);
    const coverUrl = getCoverUrl(manga.id, manga.coverFile);

    const handleFavoriteClick = (e) => {
        e.preventDefault(); // Prevent navigation when clicking the favorite button
        if (isInFavorites) {
            removeFavorite(manga.id);
        } else {
            addFavorite(manga);
        }
    };

    return (
        <Link to={`/manga/${manga.id}`}>
            <div className={`relative group rounded-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
                        isInFavorites 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-800/50 text-white hover:bg-red-500'
                    } opacity-0 group-hover:opacity-100`}
                    title={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isInFavorites ? '❤️' : '🤍'}
                </button>

                {/* Cover Image */}
                <div className="relative aspect-[2/3]">
                    <img
                        src={coverUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-3">
                    <h3 className={`font-semibold line-clamp-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        {manga.title}
                    </h3>
                    {manga.status && (
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                            {manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
