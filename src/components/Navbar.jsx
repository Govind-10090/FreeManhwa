import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { FaSun, FaMoon, FaSearch, FaHeart, FaTags } from 'react-icons/fa';

export default function Navbar() {
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Categories */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold">Manhwa</span>
                        </Link>
                        <Link 
                            to="/categories"
                            className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaTags className="text-orange-500" />
                            <span className="text-sm font-medium">Categories</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search manhwa..."
                                className={`w-full px-4 py-2 rounded-lg ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-white placeholder-gray-400' 
                                        : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                <FaSearch className="text-gray-400" />
                            </button>
                        </div>
                    </form>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/favorites"
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700' 
                                    : 'hover:bg-gray-100'
                            }`}
                            title="Favorites"
                        >
                            <FaHeart className="text-red-500" />
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700' 
                                    : 'hover:bg-gray-100'
                            }`}
                            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
