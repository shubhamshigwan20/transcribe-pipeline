const { Queue } = require("bullmq");
const db = require("../db/db");
require("dotenv").config();

const transcribeQueue = new Queue("transcribe-queue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const handleTranscription = async (req, res) => {
  const { url } = req.body;

  // validate url with zod

  const payload = url;

  const result = await transcribeQueue.add("job", payload);

  return res.status(200).json({
    status: true,
    message: `job ${result.id} added to queue`,
  });
};

const handleLogs = async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT url, status FROM logs ORDER BY url ASC",
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch logs",
    });
  }
};

const handleLogText = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Missing url query parameter",
    });
  }

  try {
    const result = await db.query(
      "SELECT transcript FROM logs WHERE url = $1 LIMIT 1",
      [url],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        status: false,
        message: "Transcript not found for given url",
      });
    }

    return res.status(200).json({
      transcript: result.rows[0].transcript,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch transcript",
    });
  }
};

module.exports = { handleTranscription, handleLogs, handleLogText };
