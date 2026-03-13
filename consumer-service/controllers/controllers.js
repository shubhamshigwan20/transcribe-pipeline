const { Queue } = require("bullmq");
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

module.exports = { handleTranscription };
