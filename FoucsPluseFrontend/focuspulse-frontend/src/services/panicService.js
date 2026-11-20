import api from './api';

export const getPanicTask = async (userId = 1) => {
  try {
    
    const response = await api.get(`/Tasks/panic-task/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching panic task:', error);
    
    return {
      title: 'take deep breath and drink some water 💧',
      description: 'take a quick break and recenter your focus without pressure.'
    };
  }
};