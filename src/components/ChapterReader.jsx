import React, { useState, useEffect, useRef } from 'react';
import { fetchChapterPages } from '../utils/api';
import { useDarkMode } from '../context/DarkModeContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ChapterReader({ 
    chapterId, 
    mangaTitle, 
    chapterNumber, 
    onClose,
    prevChapterId,
    nextChapterId,
    mangaId,
    onChapterChange
}) {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useDarkMode();
    const [showControls, setShowControls] = useState(true);
    const readerRef = useRef(null);
    const navigate = useNavigate();
    let controlsTimeout;

    useEffect(() => {
        const loadChapterPages = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchChapterPages(chapterId);
                
                if (!response.data || !response.data.baseUrl || !response.data.chapter) {
                    throw new Error('Invalid chapter data received');
                }

                const { baseUrl, chapter } = response.data;
                const { hash, data: pageFilenames } = chapter;

                // Construct full URLs for each page
                const pageUrls = pageFilenames.map(filename => 
                    `${baseUrl}/data/${hash}/${filename}`
                );

                setPages(pageUrls);
                // Reset scroll position when loading new chapter
                if (readerRef.current) {
                    readerRef.current.scrollTop = 0;
                }
            } catch (err) {
                console.error('Error loading chapter:', err);
                setError('Failed to load chapter. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadChapterPages();

        // Clean up timeout on unmount
        return () => {
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [chapterId]);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft' && prevChapterId) {
            handlePrevChapter();
        } else if (e.key === 'ArrowRight' && nextChapterId) {
            handleNextChapter();
        } else if (e.key === 'Home') {
            scrollToTop();
        } else if (e.key === 'End') {
            scrollToBottom();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [prevChapterId, nextChapterId]);

    const handlePrevChapter = () => {
        if (prevChapterId) {
            onChapterChange(prevChapterId);
        }
    };

    const handleNextChapter = () => {
        if (nextChapterId) {
            onChapterChange(nextChapterId);
        }
    };

    const scrollToTop = () => {
        if (readerRef.current) {
            readerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const scrollToBottom = () => {
        if (readerRef.current) {
            readerRef.current.scrollTo({
                top: readerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <p className="text-xl mb-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-50 bg-black overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Top Navigation Bar */}
            <div 
                className={`fixed top-0 left-0 right-0 bg-gray-900/95 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="text-white hover:text-accent transition-colors"
                                title="Back to manga details"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div className="text-white">
                                <h3 className="font-semibold">{mangaTitle}</h3>
                                <p className="text-sm text-gray-400">Chapter {chapterNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handlePrevChapter}
                                disabled={!prevChapterId}
                                className={`px-4 py-2 rounded transition-colors ${
                                    prevChapterId 
                                        ? 'bg-accent text-white hover:bg-accent/90' 
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                                title={prevChapterId ? "Previous Chapter (Left Arrow)" : "No previous chapter"}
                            >
                                ← Prev Chapter
                            </button>
                            <button 
                                onClick={handleNextChapter}
                                disabled={!nextChapterId}
                                className={`px-4 py-2 rounded transition-colors ${
                                    nextChapterId 
                                        ? 'bg-accent text-white hover:bg-accent/90' 
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                                title={nextChapterId ? "Next Chapter (Right Arrow)" : "No next chapter"}
                            >
                                Next Chapter →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reading Area */}
            <div 
                ref={readerRef}
                className="h-full overflow-y-auto pt-16 pb-16 scrollbar-hide"
            >
                <div className="max-w-4xl mx-auto">
                    {pages.map((pageUrl, index) => (
                        <div key={index} className="relative">
                            <img
                                src={pageUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 select-none"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div 
                className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="text-white text-sm">
                            {pages.length} Pages
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={scrollToTop}
                                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
                                title="Scroll to top (Home)"
                            >
                                ↑ Top
                            </button>
                            <button
                                onClick={scrollToBottom}
                                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
                                title="Scroll to bottom (End)"
                            >
                                ↓ Bottom
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}