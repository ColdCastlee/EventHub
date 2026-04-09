const express = require("express");
const router = express.Router();
const {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant
} = require("../controllers/participantController");

router.get("/", getAllParticipants);
router.get("/:id", getParticipantById);
router.post("/", createParticipant);
router.put("/:id", updateParticipant);
router.delete("/:id", deleteParticipant);

module.exports = router;