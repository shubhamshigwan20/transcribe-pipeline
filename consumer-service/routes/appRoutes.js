const router = require("express").Router();
const {
  handleTranscription,
  handleLogs,
} = require("../controllers/controllers");

router.post("/transcribe", handleTranscription);
router.get("/logs", handleLogs);

module.exports = router;
