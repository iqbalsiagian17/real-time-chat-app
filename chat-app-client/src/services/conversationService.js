import axios from '../api/axios';

export const getAllConversations = () =>
  axios.get('/conversations').then((res) => res.data.data);

export const getConversationsWithLastMessage = () =>
  axios.get('/conversations/with-last-message').then((res) => res.data.data);

export const getParticipants = (conversationId) =>
  axios.get(`/conversations/${conversationId}/participants`).then((res) => res.data.data);

export const createConversation = async (userIds, groupName = null) => {
  const response = await axios.post('/conversations', {
    participantIds: userIds, // ⬅️ ubah dari user_ids ke participantIds
    name: groupName,
    is_group: !!groupName,
  });
  return response.data.data;
};


