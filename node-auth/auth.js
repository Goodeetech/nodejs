require("dotenv").config();

const express = require("express");
const connectDB = require("./database/db");
const authRoutes = require("./routes/auth-route");
const homeRoutes = require("./routes/home-route");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
