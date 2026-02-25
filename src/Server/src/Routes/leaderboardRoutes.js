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

        // We track cumulative scores as we iterate through rounds
        let cumulativeScores = {};
        teams.forEach(t => cumulativeScores[t._id.toString()] = 0);

        for (const round of rounds) {
            const scores = await Score.find({ roundId: round._id }).populate("teamId");
            const dataPoint = { time: round.name };

            scores.forEach(s => {
                const teamName = s.teamId.name;
                cumulativeScores[s.teamId._id.toString()] += s.scoreValue;
            });

            // Populate the dataPoint with current cumulative scores
            teams.forEach(t => {
                dataPoint[t.name] = cumulativeScores[t._id.toString()];
            });

            history.push(dataPoint);
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
