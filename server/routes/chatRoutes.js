const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat/chatController');
const auth = require('../middlewares/authMiddleware');

router.post('/send', auth, chatController.sendMessage);
router.get('/:conversationId', auth, chatController.getMessages);
router.get('/unread', auth, chatController.getUnreadMessages);
router.post('/mark-as-read', auth, chatController.markMessagesAsRead);

module.exports = router;
