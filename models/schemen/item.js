const mongoose = require("mongoose");

const ItemType = {
  HOUSE: "House",
  PROPERTY: "Property",
  INDUSTRY: "Industry",
};

const itemSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    default: ItemType.PROPERTY,
    enum: Object.values(ItemType),
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  website: String,
  intended_price: Number,
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
  location: {
    place_id: {
      type: Number,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
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
