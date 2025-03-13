import axios from 'axios';

const API_URL = 'https://api.mangadex.org';

export const fetchManhua = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/manga`, { params: { title: query } });
        return response.data;
    } catch (error) {
        console.error('Error fetching manhua:', error);
        throw error;
    }
};
