import axios from '../api/axios';

export const login = async (username, password) => {
  const response = await axios.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await axios.post('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};
