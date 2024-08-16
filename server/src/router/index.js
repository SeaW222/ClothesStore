const express = require("express");
const accountRouter = require("./accountRouter");

const router = express.Router();

router.use("/account", accountRouter);

module.exports = router;
