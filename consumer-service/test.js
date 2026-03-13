require("dotenv").config();
const { downloadMp3, convertMp3ToWav } = require("./worker"); // or paste functions directly
const fs = require("fs");

async function test() {
  const testUrl = "https://files.catbox.moe/ttm3u2.mp3"; // free public mp3

  // ── Test 1: Download ──────────────────────────────────────────
  console.log("⏳ Downloading MP3...");
  try {
    await downloadMp3(testUrl, "test-audio.mp3");
    const stats = fs.statSync("test-audio.mp3");
    console.log(`✅ Download OK — file size: ${stats.size} bytes`);
  } catch (err) {
    console.error("❌ Download FAILED:", err.message);
    return;
  }

  // ── Test 2: Convert ───────────────────────────────────────────
  console.log("⏳ Converting to WAV...");
  try {
    await convertMp3ToWav("test-audio.mp3", "test-output.wav");
    const stats = fs.statSync("test-output.wav");
    console.log(`✅ Conversion OK — file size: ${stats.size} bytes`);
  } catch (err) {
    console.error("❌ Conversion FAILED:", err.message);
  }
}

test();
