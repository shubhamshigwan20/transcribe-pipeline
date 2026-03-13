const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
require("dotenv").config();
const { Worker, Queue, QueueEvents } = require("bullmq");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const db = require("./db/db");

const PORT = 6000;
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
    message: "consumer-worker running",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "consumer-worker",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

const WHISPER_API = process.env.WHISPER_API;
const queue = new Queue("transcribe-queue", {
  connection: { url: process.env.REDIS_URL },
});
const queueEvents = new QueueEvents("transcribe-queue", {
  connection: { url: process.env.REDIS_URL },
});

queueEvents.on("waiting", async ({ jobId }) => {
  const job = await queue.getJob(jobId);
  if (!job) return;

  const insertResult = await db.query(
    `INSERT INTO logs (url, status)
    VALUES ($1, 'queued')
    ON CONFLICT (url)
    DO UPDATE SET status='queued'`,
    [job.data],
  );
  if (!insertResult.rowCount) {
    console.log(`error status=start for url ${job.data}`);
  } else {
    console.log(`status=queue for url ${job.data}`);
  }
});

async function downloadMp3(url, outputPath) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
    },
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function convertMp3ToWav(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioChannels(1) // mono
      .audioFrequency(16000) // 16 kHz
      .format("wav")
      .on("end", () => {
        console.log("converted to wav");
        resolve();
      })
      .on("error", reject)
      .save(output);
  });
}

const worker = new Worker(
  "transcribe-queue",
  async (job) => {
    try {
      const queryResult = await db.query(
        `UPDATE logs SET status='start' where url = $1`,
        [job.data],
      );

      if (!queryResult.rowCount) {
        console.log(`error status=start for url ${job.data}`);
      } else {
        console.log(`status=start for url ${job.data}`);
      }
      console.log(`started working on job ${job.id}`);
      console.log(`job data ${job.data}`);

      const mp3File = `audio-${job.id}.mp3`;
      const wavFile = `output-${job.id}.wav`;

      await downloadMp3(job.data, mp3File);
      await convertMp3ToWav(mp3File, wavFile);

      const form = new FormData();
      form.append("file", fs.createReadStream(wavFile));

      const result = await axios.post(`${WHISPER_API}/transcribe`, form, {
        headers: form.getHeaders(),
      });

      const textResult = await db.query(
        `UPDATE logs SET status='complete', transcript= $1 where url = $2`,
        [result.data, job.data],
      );
      if (!textResult.rowCount) {
        console.log(`error status=complete for url ${job.data}`);
      } else {
        console.log(`status=complete for url ${job.data}`);
      }

      fs.unlinkSync(mp3File);
      fs.unlinkSync(wavFile);

      console.log(result.data);
    } catch (err) {
      console.log(err);
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`job ${job.id} completed processing`);
});

worker.on("failed", (job, err) => {
  console.log(`job ${job.id} failed processing due to ${err}`);
});

module.exports = { downloadMp3, convertMp3ToWav };
