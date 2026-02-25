const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    totalScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);
