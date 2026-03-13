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

module.exports = { handleTranscription, handleLogs };
