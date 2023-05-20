const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case

const clientSchema = new Schema(
  {
    companyName: {
      type: String,
      trim: true,
      required: false,
      unique: false
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    nipc: {
      type: Number,
      required: true,
      unique: true,
      min: 000000000,
      max: 999999999
    },
    niss: {
      type: Number,
      required: true,
      unique: true,
      min: 00000000000,
      max: 99999999999
    },
    address: {
      type: String,
      required: false,
      unique: false
    },
    imageUrl: {
      type: String,
      required: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    hotlist: [String],
    clientFiles: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatMessage' }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true
  }
);

const Client = model('Client', clientSchema);

module.exports = Client;
