const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

const PORT = process.env.PORT;
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

app.use(routes);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
