import api from './api';

export const getSoundTracks = async () => {
  try {
    const response = await api.get('/sound/traks'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching sound tracks:', error);
    return [];
  }
};