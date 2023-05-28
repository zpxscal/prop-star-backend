const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");

const {
  User,
  EmailVerify,
  UserType,
  Languages,
  ResetPasswd,
} = require("../models/shemas");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../services/authcheck");
const sendEmail = require("../services/emailer");
const TypeCheck = require("../services/typeCheck");

const router = express.Router();

router.get("/available/username", async (req, res) => {
  if (new TypeCheck(req.query.username).isUsername())
    return res.status(400).send();

  if (
    await User.exists({
      username: { $regex: `^${req.query.username.trim()}$`, $options: "i" },
    })
  )
    return res.status(409).send();

  res.send();
});

router.get("/available/email", async (req, res) => {
  if (new TypeCheck(req.query.email).isEmail()) return res.status(400).send();

  if (await User.exists({ email: req.query.email.toLowerCase().trim() }))
    return res.status(409).send();

  res.send();
});

router.post("/login", checkNotAuthenticated, async (req, res) => {
  if (
    new TypeCheck(req.body.email).isEmail() != null &&
    new TypeCheck(req.body.password).isPassword() != null
  )
    return res.status(400).send();

  const { email, password, remember } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) return res.status(401).send();

  if (await bcrypt.compare(password, user.password)) {
    return res
      .cookie(
        "token",
        jwt.sign(
          { id: user._id },
          user.password,
          !!remember
            ? {}
            : {
                expiresIn: 60 * 60 * 24,
              }
        ),
        !!remember
          ? { httpOnly: true }
          : { maxAge: 100 * 60 * 60 * 24, httpOnly: true }
      )
      .send({ emailVerified: user.emailVerified });
  }
  return res.status(401).send();
});

router.delete("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.send();
});

router.post("/register", checkNotAuthenticated, async (req, res) => {
  let error = [];
  error.push(new TypeCheck(req.body.password).isPassword());
  error.push(new TypeCheck(req.body.email).isEmail());
  error.push(new TypeCheck(req.body.username).isUsername());

  error = error.filter((e) => e != null);

  if (error.length) return res.status(400).send(error);

  const { username, email, password } = req.body;

  if (
    await User.exists({
      username: { $regex: `^${username.trim()}$`, $options: "i" },
    })
  )
    return res.status(409).send({ where: "username", error: "used" });
  else if (await User.exists({ email: email.toLowerCase().trim() }))
    return res.status(409).send({ where: "email", error: "used" });

  try {
    await bcrypt.hash(password, 10, async function (err, hash) {
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password: hash,
      });

      res
        .cookie(
          "token",
          jwt.sign({ id: user._id }, user.password, {
            expiresIn: 60 * 60 * 24,
          }),
          { maxAge: 1000 * 60 * 60 * 24 }
        )
        .status(201)
        .send();
    });
  } catch {
    return res.status(500).send();
  }
});

router.get("/resetpassword", checkNotAuthenticated, async (req, res) => {
  let error = new TypeCheck(req.query.email).isEmail();

  if (error) return res.status(400).send(error);

  const user = await User.findOne({
    email: req.query.email.toLowerCase().trim(),
  });

  if (!user) return res.send();

  const passwordReset = await ResetPasswd.create({
    user: user._id,
  });

  await sendEmail(
    user.email,
    "Reset your Password",
    `Hi ${user.username},\n\nMaybe you should remember the next Password a little better 😜.\n\nClick the Button below to set a new Password:\nhttps://eventful.com/passwortd-forgotten/${passwordReset._id}\nThis Link will expire in 10 minutes, so be quick! \n\nIf this has nothing to do with you, please just ignore it!\n\nThanks!\nYour Eventful Expert`,
    null
  );

  return res.send();
});

router.get("/resetpassword/:id", checkNotAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ where: "id", error: "invalid" });

  const passwordReset = await ResetPasswd.findById(req.params.id);

  if (!passwordReset)
    return res.status(400).send({ where: "id", error: "invalid" });

  return res.send();
});

router.put("/resetpassword/:id", checkNotAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ where: "id", error: "invalid" });

  let error = new TypeCheck(req.body.password).isPassword();

  if (error) return res.status(400).send(error);

  const passwordReset = await ResetPasswd.findById(req.params.id);

  if (!passwordReset)
    return res.status(400).send({ where: "id", error: "invalid" });

  await bcrypt.hash(req.body.password, 10, async function (err, hash) {
    await User.findByIdAndUpdate(passwordReset.user, {
      password: hash,
    });
  });

  await ResetPasswd.findByIdAndDelete(passwordReset._id);

  const user = await User.findById(passwordReset.user);

  await sendEmail(
    user.email,
    "Password successful reseted",
    `Hi ${user.username},\n\nYour Password has successfully been reseted. 👍\n\nMake sure to not forget it again 🤨\n\nThanks!\nYour Eventful Expert`,
    null
  );

  return res.send();
});

router.get("/emailverification", checkAuthenticated, async (req, res) => {
  const user = req.user;

  if (user.emailVerified) return res.status(403).send();

  await EmailVerify.deleteMany({ user: user._id });

  var emailVerification = new EmailVerify();
  emailVerification.user = user._id;

  var token = codeGenerate(6);

  while ((await EmailVerify.findOne({ token: token.toUpperCase() })) !== null) {
    token = codeGenerate(6);
  }

  emailVerification.token = token;

  await emailVerification.save();

  await sendEmail(
    user.email,
    "Verify your Email",
    `Hallo ${user.username},\n\nVielen Dank für die Nutzung von Prop-Star.😄\n\nDein persönlicher Verifizierungscode lautet: ${token}\n\nDieser ist allerdings nur 5 Minuten gültig, also beeile dich und teile
    ihn mit niemanden.\n\nWir wünschen dir viel Spaß!\nDein Prop-Star Team`,
    null
  );

  return res.send();
});

router.put("/emailverification/:code", checkAuthenticated, async (req, res) => {
  const user = req.user;

  if (user.emailVerified) return res.status(403).send();

  if (!/^[ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{6}$/i.test(req.params.code))
    return res.status(400).send();

  const emailVerify = await EmailVerify.findOneAndDelete({
    token: req.params.code.toUpperCase(),
    user: req.user._id,
  });

  if (!emailVerify) return res.status(400).send();

  await User.findByIdAndUpdate(req.user._id, { emailVerified: true });

  return res.send();
});

module.exports = router;

function codeGenerate(count) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  var result = "";
  for (var i = 0; i < count; i++) {
    var x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
}
