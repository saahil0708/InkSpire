const express = require("express");
const router = express.Router();
const Team = require("../Models/Team");

// Get leaderboard sorted by total score descending
router.get("/", async (req, res) => {
    try {
        const leaderboard = await Team.find().sort({ totalScore: -1 });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
