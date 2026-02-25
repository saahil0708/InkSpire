const express = require("express");
const router = express.Router();
const Team = require("../Models/Team");
const Round = require("../Models/Round");
const Score = require("../Models/Score");

// --- Rounds ---
router.get("/rounds", async (req, res) => {
    try {
        const rounds = await Round.find().sort({ createdAt: 1 });
        res.json(rounds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/rounds", async (req, res) => {
    const { name } = req.body;
    try {
        const newRound = new Round({ name });
        await newRound.save();
        res.status(201).json(newRound);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/rounds/:id", async (req, res) => {
    try {
        const roundId = req.params.id;

        // Delete all scores associated with this round
        await Score.deleteMany({ roundId });

        // Recalculate total scores for all teams after deleting these round scores
        const teams = await Team.find();
        for (const team of teams) {
            const allTeamScores = await Score.find({ teamId: team._id });
            const total = allTeamScores.reduce((sum, s) => sum + s.scoreValue, 0);
            await Team.findByIdAndUpdate(team._id, { totalScore: total });
        }

        // Drop the round itself
        await Round.findByIdAndDelete(roundId);
        res.json({ message: "Round deleted and scores recalculated." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Teams ---
router.get("/teams", async (req, res) => {
    try {
        let teams = await Team.find().sort({ name: 1 });

        // Ensure exactly the 4 default teams exist. If not, reset them.
        if (teams.length !== 4) {
            await Team.deleteMany({}); // Clear existing
            const defaultTeams = [
                { name: "Red Romans" },
                { name: "White Napoleans" },
                { name: "Blue Victorians" },
                { name: "Green Gladiators" }
            ];
            await Team.insertMany(defaultTeams);
            teams = await Team.find().sort({ name: 1 });
        }

        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/teams", async (req, res) => {
    const { name } = req.body;
    try {
        const newTeam = new Team({ name });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- Scores ---
router.get("/scores/:roundId", async (req, res) => {
    const { roundId } = req.params;
    try {
        const scores = await Score.find({ roundId }).populate("teamId", "name");
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Adds or updates a score for a team in a specific round, then recalculates the team's total score
router.post("/scores", async (req, res) => {
    const { teamId, roundId, scoreValue } = req.body;

    try {
        // 1. Update or create the score entry
        const score = await Score.findOneAndUpdate(
            { teamId, roundId },
            { scoreValue },
            { new: true, upsert: true }
        );

        // 2. Recalculate total score for this team
        const allTeamScores = await Score.find({ teamId });
        const total = allTeamScores.reduce((sum, s) => sum + s.scoreValue, 0);

        // 3. Update the team document
        await Team.findByIdAndUpdate(teamId, { totalScore: total });

        res.json({ message: "Score updated successfully", score, newTotalScore: total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
