const express = require("express");
const cors = require("cors");
const app = express();

const adminRoutes = require("./Routes/adminRoutes");
const leaderboardRoutes = require("./Routes/leaderboardRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

module.exports = app;
