const { Schema, model } = require('mongoose');

const chatMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Client']
  },
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Client']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatMessage = model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
