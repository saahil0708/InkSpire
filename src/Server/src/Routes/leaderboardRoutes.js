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
// Get leaderboard history for graph
router.get("/history", async (req, res) => {
    try {
        const Score = require("../Models/Score");
        const Round = require("../Models/Round");

        const rounds = await Round.find().sort({ createdAt: 1 });
        const teams = await Team.find();

        const history = [];

        // We track scores per round
        for (const round of rounds) {
            const scores = await Score.find({ roundId: round._id }).populate("teamId");
            const dataPoint = { time: round.name, isRevealed: round.isRevealed };

            // Initialize all teams to 0 for this round
            teams.forEach(t => {
                dataPoint[t.name] = 0;
            });

            // Set the actual round score if they have one
            scores.forEach(s => {
                dataPoint[s.teamId.name] = s.scoreValue;
            });

            history.push(dataPoint);
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
