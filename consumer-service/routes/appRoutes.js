const router = require("express").Router();
const {
  handleTranscription,
  handleLogs,
  handleLogText,
} = require("../controllers/controllers");

router.post("/transcribe", handleTranscription);
router.get("/logs", handleLogs);
router.get("/logs/text", handleLogText);

module.exports = router;
