import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDarkMode } from '../context/DarkModeContext';
import { Link } from 'react-router-dom';

export default function ChapterReader({ chapterId, mangaTitle, chapterNumber, onClose }) {
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [readingMode, setReadingMode] = useState('vertical');
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef(null);
    const { isDarkMode } = useDarkMode();

    // Fetch chapter data
    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
                const { baseUrl, chapter } = response.data;

                const pageUrls = chapter.data.map(filename => 
                    `${baseUrl}/data/${chapter.hash}/${filename}`
                );

                setPages(pageUrls);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching chapter:', err);
                setError('Failed to load chapter. Please try again later.');
                setLoading(false);
            }
        };

        fetchChapter();
    }, [chapterId]);

    // Handle keyboard navigation
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            containerRef.current?.scrollBy({
                top: window.innerHeight * 0.8,
                behavior: 'smooth'
            });
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            containerRef.current?.scrollBy({
                top: -window.innerHeight * 0.8,
                behavior: 'smooth'
            });
        } else if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'h') {
            setShowControls(prev => !prev);
        }
    }, [onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Track scroll position
    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const currentPos = scrollTop + clientHeight;
            const pageHeight = scrollHeight / pages.length;
            const currentPageEstimate = Math.floor(currentPos / pageHeight);
            setCurrentPage(Math.min(currentPageEstimate, pages.length - 1));
        }
    }, [pages.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
                <div className="text-white text-xl text-center p-4">
                    <p>{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
            {/* Top Navigation Bar */}
            {showControls && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onClose}
                                    className="hover:text-red-500 transition-colors"
                                >
                                    ← Back
                                </button>
                                <div className="text-sm breadcrumbs">
                                    <span className="opacity-75">Reading:</span>
                                    <span className="font-medium ml-2">{mangaTitle} - Chapter {chapterNumber}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm">
                                    Page {currentPage + 1} of {pages.length}
                                </span>
                                <button
                                    onClick={() => setShowControls(false)}
                                    className="hover:text-red-500 transition-colors"
                                >
                                    Hide UI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reading Area */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
                style={{ 
                    scrollBehavior: 'smooth',
                    paddingTop: showControls ? '4rem' : '0'
                }}
            >
                <div className="max-w-5xl mx-auto">
                    {pages.map((url, index) => (
                        <div 
                            key={url}
                            className="relative"
                        >
                            <img
                                src={url}
                                alt={`Page ${index + 1}`}
                                className="w-full"
                                loading="lazy"
                            />
                            {showControls && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            {showControls && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 text-white">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                ↑ Back to Top
                            </button>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => containerRef.current?.scrollBy({
                                        top: -window.innerHeight * 0.8,
                                        behavior: 'smooth'
                                    })}
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => containerRef.current?.scrollBy({
                                        top: window.innerHeight * 0.8,
                                        behavior: 'smooth'
                                    })}
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}