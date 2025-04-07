import axios from 'axios';

const API_URL = '/api';  // This will be proxied through webpack dev server

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Helper function to get cover URL
export const getCoverUrl = (mangaId, fileName) => {
    if (!fileName) return null;
    // Use the MangaDex CDN URL
    return `https://mangadex.org/covers/${mangaId}/${fileName}`;
};

export const fetchManhua = async (query) => {
    try {
        const response = await api.get('/manga', { 
            params: { 
                title: query,
                limit: 5,
                'contentRating[]': ['safe', 'suggestive'],
                'originalLanguage[]': ['ko'],
                'includes[]': ['cover_art'],
                'order[relevance]': 'desc'
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching manhua:', error);
        throw error;
    }
};

export const fetchMangaDetails = async (id) => {
    try {
        const response = await api.get(`/manga/${id}`, {
            params: {
                'includes[]': ['cover_art', 'author', 'artist']
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching manga details:', error);
        throw error;
    }
};

export const fetchChapters = async (id) => {
    try {
        let allChapters = [];
        let offset = 0;
        const limit = 500;
        let hasMore = true;

        while (hasMore) {
            const response = await api.get(`/manga/${id}/feed`, {
                params: {
                    'translatedLanguage[]': ['en'],
                    'order[chapter]': 'desc',
                    limit,
                    offset,
                    'includes[]': ['scanlation_group']
                }
            });

            const chapters = response.data.data;
            allChapters = [...allChapters, ...chapters];

            // Check if there are more chapters to fetch
            if (chapters.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }

        return { data: { data: allChapters } };
    } catch (error) {
        console.error('Error fetching chapters:', error);
        throw error;
    }
};

export const fetchChapterPages = async (chapterId) => {
    try {
        const response = await api.get(`/at-home/server/${chapterId}`);
        return response;
    } catch (error) {
        console.error('Error fetching chapter pages:', error);
        throw error;
    }
};

export const fetchTrendingManhwa = async () => {
    try {
        const response = await api.get('/manga', {
            params: {
                limit: 10,
                'contentRating[]': ['safe', 'suggestive'],
                'originalLanguage[]': ['ko'],
                'includes[]': ['cover_art'],
                'order[followedCount]': 'desc',
                hasAvailableChapters: true
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching trending manhwa:', error);
        throw error;
    }
};

export const fetchLatestManhwa = async (offset = 0, limit = 100) => {
    try {
        const response = await api.get('/manga', {
            params: {
                limit,
                offset,
                'contentRating[]': ['safe', 'suggestive'],
                'originalLanguage[]': ['ko'],
                'includes[]': ['cover_art'],
                'order[updatedAt]': 'desc',
                hasAvailableChapters: true
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching latest manhwa:', error);
        throw error;
    }
};

export const fetchManhwaByCategory = async (categories, sortBy, offset = 0, limit = 100) => {
    try {
        const params = {
            limit,
            offset,
            'contentRating[]': ['safe', 'suggestive'],
            'originalLanguage[]': ['ko'],
            'includes[]': ['cover_art'],
            hasAvailableChapters: true
        };

        // Set the order parameter based on sortBy
        const orderField = sortBy === 'latest' ? 'updatedAt' : 
                          sortBy === 'rating' ? 'rating' :
                          sortBy === 'trending' ? 'followedCount' : 'title';
        params[`order[${orderField}]`] = 'desc';

        if (categories.length > 0) {
            params['includedTags[]'] = categories;
        }

        const response = await api.get('/manga', { params });
        return response;
    } catch (error) {
        console.error('Error fetching manhwa by category:', error);
        throw error;
    }
};
