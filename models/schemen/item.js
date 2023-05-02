const mongoose = require("mongoose");

const ItemType = {
  HOUSE: "house",
  PROPERTY: "property",
};

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    default: "property",
    enum: Object.values(ItemType),
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  website: String,
  images: [
    {
      data: {
        type: String,
        required: true,
      },
      thumbnail: {
        type: Boolean,
        default: false,
      },
    },
  ],
  contact: {
    email: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastChanged: {
    type: Date,
    default: Date.now(),
  },
  soldAt: {
    type: Date,
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = { Item, ItemType };
