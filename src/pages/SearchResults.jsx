import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDarkMode } from '../context/DarkModeContext';
import ManhuaCard from '../components/ManhuaCard';

export default function SearchResults() {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [query, setQuery] = useState('');
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 30;
    const observerRef = useRef();
    const loadingRef = useRef(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('q');
        if (searchQuery) {
            setQuery(searchQuery);
            setMangas([]);
            setOffset(0);
            setHasMore(true);
            fetchResults(searchQuery);
        }
    }, [location.search]);

    const fetchResults = async (searchQuery, isLoadMore = false) => {
        try {
            setLoading(true);
            const response = await axios.get('https://api.mangadex.org/manga', {
                params: {
                    title: searchQuery,
                    limit: LIMIT,
                    offset: isLoadMore ? offset : 0,
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
                        coverUrl: coverFile ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}` : null,
                        rating: manga.attributes.rating?.average || 'N/A',
                        status: manga.attributes.status,
                        description: manga.attributes.description?.en || ''
                    };
                })
            );

            if (isLoadMore) {
                setMangas(prev => [...prev, ...processedResults]);
            } else {
                setMangas(processedResults);
            }

            setOffset(isLoadMore ? offset + LIMIT : LIMIT);
            setHasMore(response.data.data.length === LIMIT);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch search results. Please try again later.');
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
                fetchResults(query, true);
            }
        });

        if (node) {
            observerRef.current.observe(node);
        }
    }, [loading, hasMore, query]);

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div className={`min-h-screen pt-20 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">
                    Search Results for "{query}"
                </h1>

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
                                <p className="text-lg">No results found for "{query}"</p>
                                <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
