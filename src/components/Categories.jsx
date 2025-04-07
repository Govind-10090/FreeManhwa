import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

const categories = [
    { id: '391b0423-d847-456f-aff0-8b0cfc03066b', name: 'Action', icon: '⚔️' },
    { id: 'b29d6a3d-1569-4e7a-8caf-7557bc92cd5d', name: 'Romance', icon: '❤️' },
    { id: '4d32cc48-9f00-4cca-9b5a-a839f0764984', name: 'Comedy', icon: '😄' },
    { id: 'b9af3a63-f058-46de-a9a0-e0c13906197a', name: 'Drama', icon: '🎭' },
    { id: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc', name: 'Fantasy', icon: '🔮' },
    { id: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9', name: 'Slice of Life', icon: '🏠' },
    { id: 'eabc5b4c-6aff-42f3-b657-3e90cbd00b75', name: 'Supernatural', icon: '👻' },
    { id: '07251805-a27e-4d59-b488-f0bfbec15168', name: 'Mystery', icon: '🔍' },
    { id: 'cdad7e68-1419-41dd-bdce-27753074a640', name: 'Horror', icon: '😱' },
    { id: '3b60b75c-a2d7-4860-ab56-05f391bb889c', name: 'Psychological', icon: '🧠' },
    { id: 'f8f62932-27da-4fe4-8ee1-6779a8c5edba', name: 'Sci-Fi', icon: '🚀' },
    { id: '87cc87cd-a395-47af-b27a-93258283bbc6', name: 'Adventure', icon: '🗺️' }
];

export default function Categories() {
    const { isDarkMode } = useDarkMode();
    const [selectedSort, setSelectedSort] = useState('latest');

    return (
        <div className={`py-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Categories</h2>
                    <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className={`px-4 py-2 rounded-lg ${
                            isDarkMode 
                                ? 'bg-gray-800 text-white border-gray-700' 
                                : 'bg-white text-gray-800 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-accent`}
                    >
                        <option value="latest">Latest</option>
                        <option value="trending">Trending</option>
                        <option value="rating">Top Rated</option>
                        <option value="title">A-Z</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/category/${category.id}?sort=${selectedSort}`}
                            className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 ${
                                isDarkMode 
                                    ? 'bg-gray-800 hover:bg-gray-700' 
                                    : 'bg-white hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                            <span className="text-2xl mb-2 block">{category.icon}</span>
                            <span className="font-medium">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 