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
      const user = await User.findById(req.session.currentUser._id);
      client.chats.push(newUserMessage);
      user.chats.push(newUserMessage);

      await client.save();
      await user.save();
      await newUserMessage.save();

      res.redirect(`/clients/${client.id}`);
    } else if (senderModel === 'Client') {
      const newClientMessage = new ChatMessage({
        sender: req.session.currentUser._id,
        senderModel,
        recipient,
        recipientModel: 'User',
        content: message
      });

      const client = await Client.findById(req.session.currentUser._id);
      client.chats.push(newClientMessage);

      await client.save();
      await newClientMessage.save();

      res.redirect(`/client/dashboard`);
    }

    // Retrieve the updated messages for the specific client from the database
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.session.currentUser._id, recipient: recipient },
        { sender: recipient, recipient: req.session.currentUser._id }
      ]
    })
      .populate('sender recipient')
      .sort({ timestamp: 'desc' });

    // Redirect the user to the appropriate page
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message');
  }
}

module.exports = {
  sendMessage
};
