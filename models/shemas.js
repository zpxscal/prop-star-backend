const mongoose = require("mongoose");

const { User, UserType, Languages } = require("./schemen/user");
const { EmailVerify, ResetPasswd } = require("./schemen/tokens");

module.exports = {
  User,
  UserType,
  Languages,
  EmailVerify,
  ResetPasswd,
};
