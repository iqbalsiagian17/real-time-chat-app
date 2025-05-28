import axios from '../api/axios';

export const getMessages = (conversationId) =>
  axios.get(`/chat/${conversationId}`).then((res) => res.data.data);
