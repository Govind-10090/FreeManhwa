import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useDarkMode } from '../context/DarkModeContext';
import ManhuaCard from '../components/ManhuaCard';

export default function Home() {
    const { isDarkMode } = useDarkMode();
    const [trendingManhwas, setTrendingManhwas] = useState([]);
    const [latestManhwas, setLatestManhwas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 100;
    const observerRef = useRef();
    const loadingRef = useRef(null);

    const fetchManhwa = async (type = 'latest', isLoadMore = false) => {
        try {
            setLoading(true);
            console.log(`Fetching ${type} manhwa...`);
            const response = await axios.get('https://api.mangadex.org/manga', {
                params: {
                    limit: type === 'trending' ? 10 : LIMIT,
                    offset: type === 'latest' && isLoadMore ? offset : 0,
                    contentRating: ['safe', 'suggestive'],
                    originalLanguage: ['ko'],
                    includes: ['cover_art'],
                    order: {
                        [type === 'trending' ? 'followedCount' : 'updatedAt']: 'desc'
                    },
                    hasAvailableChapters: true
                }
            });

            const processedManhwa = await Promise.all(
                response.data.data.map(async (manga) => {
                    const coverFile = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                    const coverUrl = coverFile ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}` : null;

                    return {
                        id: manga.id,
                        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                        coverUrl,
                        rating: manga.attributes.rating?.average || 'N/A',
                        status: manga.attributes.status,
                        followCount: manga.attributes.followedCount || 0
                    };
                })
            );
            
            if (type === 'trending') {
                setTrendingManhwas(processedManhwa);
            } else {
                if (isLoadMore) {
                    setLatestManhwas(prev => [...prev, ...processedManhwa]);
                } else {
                    setLatestManhwas(processedManhwa);
                }
                setOffset(isLoadMore ? offset + LIMIT : LIMIT);
                setHasMore(response.data.data.length === LIMIT);
            }
        } catch (err) {
            console.error('Detailed error:', err.response || err);
            setError('Failed to fetch manhwa. Please try again later.');
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
                fetchManhwa('latest', true);
            }
        });

        if (node) {
            observerRef.current.observe(node);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        // Fetch both trending and latest manhwas on initial load
        Promise.all([
            fetchManhwa('trending'),
            fetchManhwa('latest')
        ]);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div className={`min-h-screen pt-20 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto">
                {/* Trending Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Trending Manhwa</h2>
                    {trendingManhwas.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {trendingManhwas.map(manga => (
                                <ManhuaCard key={manga.id} manga={manga} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Latest Updates Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Latest Updates</h2>
                    {error ? (
                        <div className="text-red-500 text-center py-8">{error}</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {latestManhwas.map((manga, index) => (
                                    <div
                                        key={manga.id}
                                        ref={index === latestManhwas.length - 1 ? lastManhwaRef : null}
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

                            {!loading && latestManhwas.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-lg">No manhwa found.</p>
                                    <p className="text-sm text-gray-500">Please try again later.</p>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
