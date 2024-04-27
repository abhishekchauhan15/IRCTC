const express = require("express");
const router = express.Router();
const { addNewTrain } = require("../controllers/adminController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

router.post("/train", authenticateUser, isAdmin, addNewTrain);

module.exports = router;
