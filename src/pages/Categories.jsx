import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import ManhuaCard from '../components/ManhuaCard';
import { categories, sortOptions } from '../data/categories';
import { fetchManhwaByCategory } from '../utils/api';

export default function Categories() {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('latest');
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 100;
    const observerRef = useRef();
    const loadingRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tag = params.get('tag');
        if (tag) {
            setSelectedCategories([tag]);
        }
    }, [location]);

    const fetchManhwa = async (isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            const selectedTagIds = selectedCategories
                .map(catId => categories.find(c => c.id === catId)?.tagId)
                .filter(Boolean);

            const response = await fetchManhwaByCategory(selectedTagIds, sortBy, isLoadMore ? offset : 0, LIMIT);
            
            const processedManhwa = await Promise.all(
                response.data.map(async (manga) => {
                    const coverFile = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                    const coverUrl = coverFile ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}` : null;

                    return {
                        id: manga.id,
                        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                        coverUrl,
                        rating: manga.attributes.rating?.average || 'N/A',
                        status: manga.attributes.status,
                        description: manga.attributes.description?.en || '',
                        year: manga.attributes.year || 'N/A',
                        tags: manga.attributes.tags?.map(tag => tag.attributes?.name?.en) || []
                    };
                })
            );

            if (isLoadMore) {
                setMangas(prev => [...prev, ...processedManhwa]);
            } else {
                setMangas(processedManhwa);
            }

            setOffset(isLoadMore ? offset + LIMIT : LIMIT);
            setHasMore(response.data.length === LIMIT);
        } catch (err) {
            setError('Failed to fetch manhwa. Please try again later.');
            console.error('Error fetching manhwa:', err);
        } finally {
            setLoading(false);
        }
    };

    const lastManhwaRef = useCallback(node => {
        if (loading) return;
        
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchManhwa(true);
            }
        });

        if (node) {
            observerRef.current.observe(node);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        setOffset(0);
        setMangas([]);
        setHasMore(true);
        fetchManhwa();
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [selectedCategories, sortBy]);

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            }
            return [...prev, categoryId];
        });
    };

    return (
        <div className={`min-h-screen pt-20 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto">
                <div className={`sticky top-16 z-40 mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h2 className="text-xl font-bold mb-4">Manhwa Categories</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => toggleCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategories.includes(category.id)
                                        ? 'bg-red-500 text-white'
                                        : isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Sort by:</span>
                        <div className="flex gap-2">
                            {sortOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        sortBy === option.id
                                            ? 'bg-red-500 text-white'
                                            : isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="text-red-500 text-center py-8">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {mangas.map((manga, index) => (
                                <div
                                    key={manga.id}
                                    ref={index === mangas.length - 1 ? lastManhwaRef : null}
                                >
                                    <ManhuaCard manga={manga} />
                                </div>
                            ))}
                        </div>
                        
                        {loading && (
                            <div className="flex justify-center py-8" ref={loadingRef}>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        )}

                        {!loading && mangas.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-lg">No manhwa found for the selected categories.</p>
                                <p className="text-sm text-gray-500">Try selecting different categories or changing the sort order.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 