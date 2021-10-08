const mongoose = require("mongoose");

const ChatHistory = mongoose.model(
  "ChatHistory",
  new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: String,
    type: String,
    read: mongoose.Schema.Types.Number,
    sent_at: String
  })
);

module.exports = ChatHistory;
