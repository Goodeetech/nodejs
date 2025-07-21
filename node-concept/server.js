require("dotenv").config();
const express = require("express");
const { configCors } = require("./config/corsConfig");
const {
  requestLogger,
  addTimeStamp,
} = require("./middleware/customMiddleware");

const app = express();

app.use(requestLogger);
app.use(addTimeStamp);
app.use(express.json());
app.use(configCors());
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
