import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { fetchManhua, getCoverUrl } from '../utils/api';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const searchManhwa = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await fetchManhua(query);
                setResults(response.data.data);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to search manhwa. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        searchManhwa();
    }, [query]);

    if (loading) {
        return (
            <div className={`min-h-screen pt-20 pb-12 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">{error}</p>
                    <Link to="/" className="text-accent hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-20 pb-12 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">
                    Search Results for "{query}"
                </h1>

                {results.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">
                            No results found for "{query}"
                        </p>
                        <Link to="/" className="text-accent hover:underline block mt-4">
                            Return to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((manhwa) => {
                            const coverFile = manhwa.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                            const coverUrl = getCoverUrl(manhwa.id, coverFile);

                            return (
                                <Link
                                    key={manhwa.id}
                                    to={`/manga/${manhwa.id}`}
                                    className="group"
                                >
                                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 mb-2">
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={manhwa.attributes.title.en}
                                                className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                No Cover
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                                        {manhwa.attributes.title.en || Object.values(manhwa.attributes.title)[0]}
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
