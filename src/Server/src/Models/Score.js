const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    roundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Round",
        required: true
    },
    scoreValue: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure a team only has one score per round
scoreSchema.index({ teamId: 1, roundId: 1 }, { unique: true });

module.exports = mongoose.model("Score", scoreSchema);
