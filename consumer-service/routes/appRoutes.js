const router = require("express").Router();
const { handleTranscription } = require("../controllers/controllers");

router.post("/transcribe", handleTranscription);

module.exports = router;
