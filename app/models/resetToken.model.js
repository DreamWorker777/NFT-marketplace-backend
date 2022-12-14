const mongoose = require("mongoose");

const ResetToken = mongoose.model(
  "ResetToken",
  new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 900,
    },
  })
);

module.exports = ResetToken;
