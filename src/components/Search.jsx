import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { fetchManhua } from '../utils/api';

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
                    const response = await fetchManhua(query);
                    const processedResults = await Promise.all(
                        response.data.map(async (manga) => {
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
        <div ref={searchRef} className="relative">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search manhwa..."
                    className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
                <button
                    type="submit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                        isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    🔍
                </button>
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && (query.length >= 2) && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-50 ${
                    isDarkMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                }`}>
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            {results.map((manga) => (
                                <Link
                                    key={manga.id}
                                    to={`/manga/${manga.id}`}
                                    className={`flex items-center p-3 hover:bg-accent/10 transition-colors ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setQuery('');
                                    }}
                                >
                                    {manga.coverUrl && (
                                        <img
                                            src={manga.coverUrl}
                                            alt={manga.title}
                                            className="w-12 h-16 object-cover rounded mr-3"
                                        />
                                    )}
                                    <span className="truncate">{manga.title}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-4 text-center ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 