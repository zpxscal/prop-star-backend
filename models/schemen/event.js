const mongoose = require("mongoose");

const EventType = {
  GARDEN: "garden",
  HOUSE: "house",
  CLUB: "club",
  CONCERT: "concert",
};

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  avatar: {
    data: Buffer,
    contentType: String,
  },
  features: {
    drinks: Boolean,
    food: Boolean,
  },
  location: {
    country: {
      type: String,
      required: true,
      default: "Austria",
    },
    city: {
      type: String,
      required: true,
      default: "Graz",
    },
    plz: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    housenr: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startsAt: {
    type: Date,
  },
  endsAt: {
    type: Date,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = { Event, EventType };
