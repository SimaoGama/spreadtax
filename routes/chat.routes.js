const express = require('express');
const router = express.Router();
const chatController = require('../config/chatControler');
const ChatMessage = require('../models/Chat.model');

// Route for handling chat message submission
router.post('/chat/send/:userId', chatController.sendMessage);

router.get('/:clientId/chat', async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Retrieve chat messages for the specific client from the database
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.session.currentUser._id, recipient: clientId },
        { sender: clientId, recipient: req.session.currentUser._id }
      ]
    })
      .populate('sender recipient')
      .sort({ timestamp: 'asc' });

    res.render('chat', { messages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve chat messages');
  }
});

module.exports = router;
