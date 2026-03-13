const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const routes = require("./routes/appRoutes");

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
    message: "consumer-service running",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "consumer-service",
    timestamp: new Date().toISOString(),
  });
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
