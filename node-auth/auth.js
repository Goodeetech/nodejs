require("dotenv").config();

const express = require("express");
const connectDB = require("./database/db");
const authRoutes = require("./routes/auth-route");
const homeRoutes = require("./routes/home-route");
const adminRoutes = require("./routes/admin-route");
const uploadImageRoute = require("./routes/image-routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/image", uploadImageRoute);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
