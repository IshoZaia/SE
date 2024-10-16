import axios from 'axios';

// Base URLs for auth and course APIs
const authAPI = axios.create({ baseURL: 'http://localhost:5000/api/auth' });
const coursesAPI = axios.create({ baseURL: 'http://localhost:5000/api/courses' });

// Helper function to set the Authorization token in headers
const setAuthToken = (config) => {
  const token = localStorage.getItem('token');
  console.log('Token being used:', token); // Debug log

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Attach the token
  }
  return config;
};

// Request interceptors to attach token to requests
authAPI.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
coursesAPI.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));

// Handle token expiration or invalid token
const handleAuthError = async (error) => {
  if (error.response?.status === 401) {
    console.warn('Token expired or invalid. Redirecting to login.');
    logout(); // Clear token and redirect
    window.location.href = '/login'; // Ensure redirection to login
  }
  return Promise.reject(error);
};

// Attach response interceptors to handle errors gracefully
authAPI.interceptors.response.use((response) => response, handleAuthError);
coursesAPI.interceptors.response.use((response) => response, handleAuthError);

// Authentication Functions
export const register = (userData) => authAPI.post('/register', userData);

export const login = async (userData) => {
  try {
    const { data } = await authAPI.post('/login', userData);
    localStorage.setItem('token', data.token); // Store token on successful login
    localStorage.setItem('userId', data.userId); // Store userId for personalized routes
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Propagate error for UI handling
  }
};

export const logout = () => {
  localStorage.removeItem('token'); // Clear token
  localStorage.removeItem('userId'); // Clear userId
  window.location.href = '/login'; // Redirect to login page
};

export const getProfile = () => authAPI.get('/profile');

// Course Management Functions
export const createCourse = (courseData) =>
  coursesAPI.post('/create', courseData);

export const getCourses = async () => {
  try {
    const { data } = await coursesAPI.get('/');
    return data.courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getPreviousQuestions = async (courseId, page = 1) => {
  try {
    const response = await coursesAPI.get(`/${courseId}/previous-questions`, {
      params: { page },
    });

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from the server.');
    }
  } catch (error) {
    console.error('Error fetching previous questions:', error);
    throw error;
  }
};

export const submitAnswers = async (courseId, userId, data) => {
  try {
    const response = await coursesAPI.post(`/submit/${courseId}/${userId}`, data);
    console.log('Answers submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw error;
  }
};


export const getPersonalizedQuestions = (courseId, userId) =>
  coursesAPI.get(`/${courseId}/questions/${userId}`);

export const uploadFile = (courseId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return coursesAPI.post(`/upload/${courseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateCourse = (courseId, updates) =>
  coursesAPI.put(`/update/${courseId}`, updates);

export const addMember = async (courseId, username) => {
  try {
    const response = await coursesAPI.post(`/${courseId}/add-member`, {
      username,
    });

    console.log('Add Member Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const { data } = await coursesAPI.get(`/search-users?query=${query}`);
    return data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await coursesAPI.delete(`/${courseId}`);
    console.log('Course deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};