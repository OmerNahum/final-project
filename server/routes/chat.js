const express = require("express");
const router2 = express.Router();

router2.get("/", (req, res) => {
  res.send("server is up and running");
});

module.exports = router2;
