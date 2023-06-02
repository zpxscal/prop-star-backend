const mongoose = require("mongoose");

const Languages = {
  EN: "en",
  DE: "de",
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    data: Buffer,
    contentType: String,
  },
  settings: {
    language: {
      type: String,
      default: "en",
      enum: Object.values(Languages),
      required: true,
    },
  },
  contact: {
    email: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastActive: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User, Languages };
