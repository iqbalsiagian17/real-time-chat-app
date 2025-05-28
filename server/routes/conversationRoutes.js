const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/conversation/conversationController');

router.post('/', auth, controller.createConversation);
router.get('/', auth, controller.getUserConversations);
router.get('/with-last-message', auth, controller.getUserConversationsWithLastMessage);
router.get('/:id/participants', auth, controller.getParticipants);
router.patch('/:id', auth, controller.renameConversation);
router.delete('/:id/leave', auth, controller.leaveConversation);

module.exports = router;
