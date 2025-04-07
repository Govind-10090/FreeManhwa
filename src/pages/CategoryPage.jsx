import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { fetchManhwaByCategory, getCoverUrl } from '../utils/api';
import { useDarkMode } from '../context/DarkModeContext';

const categories = {
    '391b0423-d847-456f-aff0-8b0cfc03066b': 'Action',
    'b29d6a3d-1569-4e7a-8caf-7557bc92cd5d': 'Romance',
    '4d32cc48-9f00-4cca-9b5a-a839f0764984': 'Comedy',
    'b9af3a63-f058-46de-a9a0-e0c13906197a': 'Drama',
    'cdc58593-87dd-415e-bbc0-2ec27bf404cc': 'Fantasy',
    'e5301a23-ebd9-49dd-a0cb-2add944c7fe9': 'Slice of Life',
    'eabc5b4c-6aff-42f3-b657-3e90cbd00b75': 'Supernatural',
    '07251805-a27e-4d59-b488-f0bfbec15168': 'Mystery',
    'cdad7e68-1419-41dd-bdce-27753074a640': 'Horror',
    '3b60b75c-a2d7-4860-ab56-05f391bb889c': 'Psychological',
    'f8f62932-27da-4fe4-8ee1-6779a8c5edba': 'Sci-Fi',
    '87cc87cd-a395-47af-b27a-93258283bbc6': 'Adventure'
};

export default function CategoryPage() {
    const { categoryId } = useParams();
    const [searchParams] = useSearchParams();
    const sortBy = searchParams.get('sort') || 'latest';
    const [manhwa, setManhwa] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const loadManhwa = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchManhwaByCategory([categoryId], sortBy);
                setManhwa(response.data.data);
            } catch (err) {
                console.error('Error loading manhwa:', err);
                setError('Failed to load manhwa. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadManhwa();
    }, [categoryId, sortBy]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">{error}</p>
                    <Link to="/" className="text-accent hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-20 pb-12 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">
                        {categories[categoryId] || 'Unknown Category'} Manhwa
                    </h1>
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            const newSearchParams = new URLSearchParams(searchParams);
                            newSearchParams.set('sort', e.target.value);
                            window.history.pushState({}, '', `?${newSearchParams.toString()}`);
                        }}
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

                {manhwa.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">
                            No manhwa found in this category
                        </p>
                        <Link to="/" className="text-accent hover:underline block mt-4">
                            Return to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {manhwa.map((item) => {
                            const coverFile = item.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                            const coverUrl = getCoverUrl(item.id, coverFile);

                            return (
                                <Link
                                    key={item.id}
                                    to={`/manga/${item.id}`}
                                    className="group"
                                >
                                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 mb-2">
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={item.attributes.title.en}
                                                className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                No Cover
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                                        {item.attributes.title.en || Object.values(item.attributes.title)[0]}
                                    </h3>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
} 