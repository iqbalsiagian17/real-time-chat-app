import axios from '../api/axios';

export const getAllUsers = async () => {
  const res = await axios.get('/users'); // ✅ sesuaikan dengan backend
  return res.data;
};
