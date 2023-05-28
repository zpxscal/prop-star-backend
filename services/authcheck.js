const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { User } = require("../models/shemas");

async function checkAuthenticated(req, res, next) {
  const auth = await checkJWT(req.cookies.token);

  if (auth === 500) return res.status(500).send();

  if (!auth) return res.status(401).send();

  req.user = auth;
  return next();
}

async function checkNotAuthenticated(req, res, next) {
  const auth = await checkJWT(req.cookies.token);

  if (auth === 500) return res.status(500).send();

  if (auth) return res.status(403).send({ emailVerified: auth.emailVerified });

  return next();
}

async function checkJWT(token) {
  try {
    if (!token) return false;

    const decoded = jwt.decode(token);

    if (!decoded || !decoded.id || typeof decoded.id !== "string") return false;

    const user = await User.findById(decoded.id).lean();

    if (!user) return false;

    const authData = jwt.verify(token.toString(), user.password);

    if (!authData) return false;

    return user;
  } catch (err) {
    console.log(err);
    return 500;
  }
}

module.exports = { checkAuthenticated, checkNotAuthenticated };
