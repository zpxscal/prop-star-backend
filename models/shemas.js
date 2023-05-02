const mongoose = require("mongoose");

const { User, UserType, Languages } = require("./schemen/user");
const { EmailVerify, ResetPasswd } = require("./schemen/tokens");
const { Event, EventType } = require("./schemen/event");

module.exports = {
  User,
  UserType,
  Languages,
  EmailVerify,
  ResetPasswd,
  Event,
  EventType,
};
