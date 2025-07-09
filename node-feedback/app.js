const express = require("express");
const connectDB = require("./database/db");
const feedbackRoutes = require("./routes/feedback-routes");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

connectDB();

app.listen(process.env.PORT, () => {
  console.log("App listening at port 3000");
});
