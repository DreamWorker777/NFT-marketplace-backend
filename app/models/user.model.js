const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    avata: String,
    username: String,
    first: String,
    last: String,
    email: String,
    password: String,
    createdAt: Date,
    walletId: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    twofactor: {
        tempSecret: String,
        dataURL: String,
        otpURL: String
    }
  })
);

module.exports = User;
