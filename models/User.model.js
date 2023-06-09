const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: false,
      unique: true
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
    imageUrl: {
      type: String,
      required: false
    },
    isAdmin: {
      type: Boolean,
      default: true
    },
    accountType: {
      isFree: {
        type: Boolean,
        default: true
      },
      isPremium: {
        type: Boolean,
        default: false
      },
      isUnlimited: {
        type: Boolean,
        default: false
      }
    },
    userClients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatMessage' }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    strictPopulate: false
  }
);

const User = model('User', userSchema);

module.exports = User;
