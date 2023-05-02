const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  try {
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;
