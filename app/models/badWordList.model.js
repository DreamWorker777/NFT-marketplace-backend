const mongoose = require("mongoose");

const BadWordList = mongoose.model(
  "BadWordList",
  new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
  })
);

module.exports = BadWordList;
