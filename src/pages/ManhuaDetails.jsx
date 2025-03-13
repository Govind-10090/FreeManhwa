import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChapterReader from '../components/ChapterReader';
import { useDarkMode } from '../context/DarkModeContext';

export default function ManhuaDetails() {
    const { id } = useParams();
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [filteredChapters, setFilteredChapters] = useState([]);
    const [displayedChapters, setDisplayedChapters] = useState([]);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const fetchMangaDetails = async () => {
            try {
                // Fetch manga details
                const mangaResponse = await axios.get(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
                const mangaData = mangaResponse.data.data;
                
                // Process manga data
                const coverFile = mangaData.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
                const authors = mangaData.relationships.filter(rel => rel.type === 'author').map(author => author.attributes?.name);
                const artists = mangaData.relationships.filter(rel => rel.type === 'artist').map(artist => artist.attributes?.name);

                const processedManga = {
                    id: mangaData.id,
                    title: mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0],
                    description: mangaData.attributes.description.en || Object.values(mangaData.attributes.description)[0],
                    coverImage: coverFile ? `https://uploads.mangadex.org/covers/${id}/${coverFile}` : null,
                    status: mangaData.attributes.status,
                    year: mangaData.attributes.year,
                    tags: mangaData.attributes.tags.map(tag => tag.attributes.name.en),
                    authors,
                    artists
                };

                setManga(processedManga);

                // Fetch chapters
                const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${id}/feed`, {
                    params: {
                        translatedLanguage: ['en'],
                        order: { chapter: 'desc' },
                        limit: 500,
                        offset: 0,
                        includes: ['scanlation_group']
                    }
                });

                const processedChapters = chaptersResponse.data.data.map(chapter => ({
                    id: chapter.id,
                    chapter: chapter.attributes.chapter,
                    title: chapter.attributes.title,
                    pages: chapter.attributes.pages,
                    publishedAt: new Date(chapter.attributes.publishAt).toLocaleDateString(),
                    group: chapter.relationships.find(rel => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown Group'
                })).sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter));

                setChapters(processedChapters);
                setFilteredChapters(processedChapters);
                setDisplayedChapters(processedChapters);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching manga details:', err);
                setError('Failed to load manga details. Please try again later.');
                setLoading(false);
            }
        };

        fetchMangaDetails();

        // Check if manga is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some(fav => fav.id === id));
    }, [id]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (isFavorite) {
            const newFavorites = favorites.filter(fav => fav.id !== id);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
        } else if (manga) {
            favorites.push(manga);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        
        setIsFavorite(!isFavorite);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            </div>
        );
    }

    if (error || !manga) {
        return (
            <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <p className="text-xl">{error || 'Manga not found'}</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br ${
            isDarkMode 
                ? 'from-gray-900 via-gray-800 to-gray-900' 
                : 'from-gray-50 via-white to-gray-100'
        }`}>
            <div className="container mx-auto max-w-7xl">
                {/* Manga details section */}
                <div className={`backdrop-blur-xl bg-white/10 dark:bg-gray-800/30 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/30`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                        {/* Cover image and favorite button */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative">
                                <img
                                    src={manga.coverImage}
                                    alt={manga.title}
                                    className="w-full rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500"
                                />
                                <button
                                    onClick={toggleFavorite}
                                    className="absolute top-4 right-4 p-4 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-gray-800/30 shadow-xl hover:shadow-2xl border border-white/20 dark:border-gray-700/30 transition-all duration-300 transform hover:scale-110"
                                >
                                    {isFavorite ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </div>

                        {/* Manga information */}
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                                    {manga.title}
                                </h1>
                                <div className="flex flex-wrap gap-3">
                                    <span className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md ${
                                        isDarkMode 
                                            ? 'bg-accent/20 text-accent-light border border-accent/20' 
                                            : 'bg-accent/10 text-accent-dark border border-accent/10'
                                    }`}>
                                        Status: {manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}
                                    </span>
                                    {manga.year && (
                                        <span className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md ${
                                            isDarkMode 
                                                ? 'bg-gray-700/30 text-gray-300 border border-gray-700/30' 
                                                : 'bg-gray-200/50 text-gray-700 border border-gray-200/50'
                                        }`}>
                                            Year: {manga.year}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4">
                                {chapters.length > 0 && (
                                    <button
                                        onClick={() => setSelectedChapter(chapters[0])}
                                        className={`group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg hover:shadow-accent/50'
                                                : 'bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg hover:shadow-accent/30'
                                        }`}
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-purple-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></span>
                                        <span className="relative">Read First Chapter</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => document.getElementById('chapters-section').scrollIntoView({ behavior: 'smooth' })}
                                    className={`group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                                        isDarkMode
                                            ? 'backdrop-blur-md bg-gray-700/30 text-white border border-gray-700/30'
                                            : 'backdrop-blur-md bg-gray-200/50 text-gray-800 border border-gray-200/50'
                                    }`}
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-500/20 to-gray-700/20 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></span>
                                    <span className="relative">Search Chapters</span>
                                </button>
                            </div>

                            {(manga.authors?.length > 0 || manga.artists?.length > 0) && (
                                <div className="space-y-3 backdrop-blur-md bg-white/5 dark:bg-gray-800/20 rounded-xl p-4 border border-white/10 dark:border-gray-700/30">
                                    {manga.authors?.length > 0 && (
                                        <p className="text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Author(s):</span>{' '}
                                            <span className="font-medium">{manga.authors.join(', ')}</span>
                                        </p>
                                    )}
                                    {manga.artists?.length > 0 && (
                                        <p className="text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Artist(s):</span>{' '}
                                            <span className="font-medium">{manga.artists.join(', ')}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {manga.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {manga.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700/30 text-gray-300 border border-gray-700/30 hover:bg-gray-600/30' 
                                                    : 'bg-gray-200/50 text-gray-700 border border-gray-200/50 hover:bg-gray-300/50'
                                            }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className={`text-base leading-relaxed backdrop-blur-md bg-white/5 dark:bg-gray-800/20 rounded-xl p-6 border border-white/10 dark:border-gray-700/30 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                {manga.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapters section */}
                <div id="chapters-section" className="mt-12 max-w-4xl mx-auto">
                    <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/30 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-accent to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">★</span>
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                                    Chapters
                                </h2>
                            </div>
                            <div className="w-full sm:w-auto sm:ml-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search chapters..."
                                        className={`w-full sm:w-80 px-6 py-4 rounded-xl backdrop-blur-md transition-all duration-300 ${
                                            isDarkMode
                                                ? 'bg-gray-700/30 text-white placeholder-gray-400 border border-gray-700/30 focus:border-accent/50'
                                                : 'bg-white/50 text-gray-800 placeholder-gray-500 border border-gray-200/50 focus:border-accent/50'
                                        } focus:outline-none focus:ring-2 focus:ring-accent/20`}
                                        onChange={(e) => {
                                            const searchTerm = e.target.value.toLowerCase();
                                            const filtered = chapters.filter(chapter =>
                                                chapter.chapter.toLowerCase().includes(searchTerm) ||
                                                (chapter.title && chapter.title.toLowerCase().includes(searchTerm)) ||
                                                chapter.group.toLowerCase().includes(searchTerm)
                                            );
                                            setFilteredChapters(filtered);
                                            setDisplayedChapters(filtered);
                                        }}
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        🔍
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {displayedChapters.map((chapter, index) => (
                                <button
                                    key={chapter.id}
                                    onClick={() => setSelectedChapter(chapter)}
                                    className={`w-full px-6 py-4 text-left backdrop-blur-md rounded-xl transition-all duration-300 hover:scale-[1.01] ${
                                        isDarkMode 
                                            ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-700/30' 
                                            : 'bg-white/50 hover:bg-white/80 border border-gray-200/50'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">
                                                    Chapter {chapter.chapter}
                                                </span>
                                                {index === 0 && (
                                                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {chapter.title && (
                                                    <span className={`text-sm ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        {chapter.title}
                                                    </span>
                                                )}
                                                <span className={`text-sm ${
                                                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                                }`}>
                                                    • {chapter.group}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-medium ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            {chapter.publishedAt}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter reader modal */}
            {selectedChapter && (
                <ChapterReader
                    chapterId={selectedChapter.id}
                    onClose={() => setSelectedChapter(null)}
                />
            )}
        </div>
    );
}
