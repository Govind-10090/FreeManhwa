import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDarkMode } from '../context/DarkModeContext';

export default function Search() {
    const { isDarkMode } = useDarkMode();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length >= 2) {
            setLoading(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await axios.get('https://api.mangadex.org/manga', {
                        params: {
                            title: query,
                            limit: 5,
                            contentRating: ['safe', 'suggestive'],
                            originalLanguage: ['ko'],
                            includes: ['cover_art'],
                            order: {
                                relevance: 'desc'
                            }
                        }
                    });

                    const processedResults = await Promise.all(
                        response.data.data.map(async (manga) => {
                            const coverFile = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                            return {
                                id: manga.id,
                                title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                                coverUrl: coverFile ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` : null
                            };
                        })
                    );

                    setResults(processedResults);
                    setShowDropdown(true);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setLoading(false);
                }
            }, 300);
        } else {
            setResults([]);
            setShowDropdown(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowDropdown(false);
            setQuery('');
        }
    };

    return (
        <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search manhwa..."
                        className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 
                            ${isDarkMode 
                                ? 'bg-gray-800 text-white placeholder-gray-400' 
                                : 'bg-white text-gray-900 placeholder-gray-500'}`}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        </div>
                    )}
                </div>
            </form>

            {showDropdown && results.length > 0 && (
                <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {results.map(result => (
                        <div
                            key={result.id}
                            onClick={() => {
                                navigate(`/manhwa/${result.id}`);
                                setShowDropdown(false);
                                setQuery('');
                            }}
                            className={`flex items-center p-3 cursor-pointer hover:bg-red-500 hover:text-white
                                ${isDarkMode ? 'text-white hover:bg-opacity-50' : 'text-gray-900'}`}
                        >
                            {result.coverUrl && (
                                <img
                                    src={result.coverUrl}
                                    alt={result.title}
                                    className="w-10 h-14 object-cover rounded mr-3"
                                />
                            )}
                            <div className="flex-1">
                                <p className="line-clamp-2 text-sm">{result.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 