import api from './api';

export const createTask = async (taskData) => {
  const response = await api.post('/Tasks/create', taskData);
  return response.data;
};

export const getUserTasks = async (userId = 1) => {
  const response = await api.get(`/Tasks/user/${userId}`);
  return response.data;
};


export const toggleMicroTask = async (microTaskId) => {
  const response = await api.post(`/Tasks/microtask/toggle/${microTaskId}`);
  return response.data;
};


export const deleteTask = async (taskId) => {
  const response = await api.delete(`/Tasks/${taskId}`);
  return response.data;
};