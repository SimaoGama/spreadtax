const ChatMessage = require('../models/Chat.model');
const Client = require('../models/Client.model');
const User = require('../models/User.model');

async function sendMessage(req, res) {
  const { recipient, message, senderModel } = req.body;

  console.log(senderModel);

  try {
    if (senderModel === 'User') {
      const newUserMessage = new ChatMessage({
        sender: req.session.currentUser,
        senderModel,
        recipient,
        recipientModel: 'Client',
        content: message
      });

      await newUserMessage.save();

      // Save the message reference inside the client
      const client = await Client.findById(recipient);
      client.chats.push(newUserMessage);

      await client.save();
    } else if (senderModel === 'Client') {
      const newClientMessage = new ChatMessage({
        sender: req.session.currentUser,
        senderModel,
        recipient,
        recipientModel: 'User',
        content: message
      });

      await newClientMessage.save();
    }

    res.redirect(`/${recipient}/chat`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message');
  }
}

module.exports = {
  sendMessage
};
