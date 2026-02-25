const express = require("express");
const cors = require("cors");
const app = express();

const adminRoutes = require("./Routes/adminRoutes");
const leaderboardRoutes = require("./Routes/leaderboardRoutes");

app.use(cors({
    origin: ["https://ink-spire-pearl.vercel.app", "http://localhost:3000"]
}));
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

module.exports = app;
