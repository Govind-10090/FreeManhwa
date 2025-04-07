import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { fetchMangaDetails, fetchChapters } from '../utils/api';
import ChapterReader from '../components/ChapterReader';

export default function ManhuaDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch manga details
                const mangaResponse = await fetchMangaDetails(id);
                if (!mangaResponse.data || !mangaResponse.data.data) {
                    throw new Error('Invalid manga data received');
                }

                const mangaData = mangaResponse.data.data;
                const coverFile = mangaData.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                const authors = mangaData.relationships
                    .filter(rel => rel.type === 'author')
                    .map(author => author.attributes?.name)
                    .filter(Boolean);
                const artists = mangaData.relationships
                    .filter(rel => rel.type === 'artist')
                    .map(artist => artist.attributes?.name)
                    .filter(Boolean);

                const processedManga = {
                    id: mangaData.id,
                    title: mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0],
                    description: mangaData.attributes.description?.en || Object.values(mangaData.attributes.description || {})[0] || 'No description available.',
                    coverImage: coverFile ? `https://uploads.mangadex.org/covers/${id}/${coverFile}` : null,
                    status: mangaData.attributes.status,
                    year: mangaData.attributes.year,
                    rating: mangaData.attributes.rating?.average || 0,
                    views: mangaData.attributes.views || 'N/A',
                    tags: mangaData.attributes.tags.map(tag => tag.attributes.name.en),
                    authors,
                    artists
                };

                setManga(processedManga);

                // Fetch chapters
                const chaptersResponse = await fetchChapters(id);
                if (!chaptersResponse.data || !chaptersResponse.data.data) {
                    throw new Error('Invalid chapters data received');
                }

                const processedChapters = chaptersResponse.data.data
                    .map(chapter => ({
                        id: chapter.id,
                        chapter: chapter.attributes.chapter,
                        title: chapter.attributes.title,
                        pages: chapter.attributes.pages,
                        publishedAt: new Date(chapter.attributes.publishAt).toLocaleDateString(),
                        group: chapter.relationships.find(rel => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown Group'
                    }))
                    .sort((a, b) => {
                        const chapterA = parseFloat(a.chapter);
                        const chapterB = parseFloat(b.chapter);
                        return isNaN(chapterB) - isNaN(chapterA) || chapterB - chapterA;
                    });

                setChapters(processedChapters);
            } catch (err) {
                console.error('Error fetching details:', err);
                setError('Failed to load manhwa details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
            </div>
        );
    }

    if (error || !manga) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="text-lg mb-6">{error || 'Manhwa not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="hover:text-accent">Home</Link>
                    <span>/</span>
                    <Link to="/drama" className="hover:text-accent">Drama</Link>
                    <span>/</span>
                    <span className="text-gray-400">{manga.title}</span>
                </div>
            </div>

            {/* Title */}
            <div className="container mx-auto px-4 py-4">
                <h1 className="text-3xl font-bold">{manga.title}</h1>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Left Column - Cover and Stats */}
                    <div className="md:col-span-1">
                        <div className="space-y-6">
                            {/* Cover Image */}
                            <div className="aspect-[3/4] rounded-lg overflow-hidden">
                                <img
                                    src={manga.coverImage}
                                    alt={manga.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Stats */}
                            <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-5 h-5 ${star <= Math.round(manga.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2">{manga.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Average {manga.rating.toFixed(1)} / 5 out of 6</p>
                                </div>

                                {/* Rank */}
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Rank: N/A, it has {manga.views} monthly views
                                    </p>
                                </div>

                                {/* Genres */}
                                <div>
                                    <p className="text-sm font-semibold mb-2">Genre(s)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {manga.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 text-sm bg-accent/20 text-accent-light rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Status: <span className="text-accent">{manga.status}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary and Chapters */}
                    <div className="md:col-span-3 space-y-8">
                        {/* Summary */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">SUMMARY</h2>
                            <p className="text-gray-300 leading-relaxed">{manga.description}</p>
                        </div>

                        {/* Latest Chapters */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">ALL CHAPTERS</h2>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-accent hover:underline flex items-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refresh</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {chapters.map((chapter) => (
                                    <button
                                        key={chapter.id}
                                        onClick={() => setSelectedChapter(chapter)}
                                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                                            isDarkMode
                                                ? 'bg-gray-800/50 hover:bg-gray-800'
                                                : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold">
                                                    Chapter {chapter.chapter}
                                                </span>
                                                {chapter.title && (
                                                    <span className="ml-2 text-gray-400">
                                                        - {chapter.title}
                                                    </span>
                                                )}
                                                <div className="text-sm text-gray-400">
                                                    {chapter.group} • {chapter.publishedAt}
                                                </div>
                                            </div>
                                            {chapter === chapters[0] && (
                                                <span className="px-2 py-1 text-xs bg-red-500 text-white rounded uppercase">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter Reader Modal */}
            {selectedChapter && (
                <ChapterReader
                    chapterId={selectedChapter.id}
                    mangaTitle={manga.title}
                    chapterNumber={selectedChapter.chapter}
                    onClose={() => setSelectedChapter(null)}
                    mangaId={id}
                    nextChapterId={
                        chapters[chapters.findIndex(c => c.id === selectedChapter.id) - 1]?.id
                    }
                    prevChapterId={
                        chapters[chapters.findIndex(c => c.id === selectedChapter.id) + 1]?.id
                    }
                    onChapterChange={(newChapterId) => {
                        const newChapter = chapters.find(c => c.id === newChapterId);
                        if (newChapter) {
                            setSelectedChapter(newChapter);
                        }
                    }}
                />
            )}
        </div>
    );
} 