const mongoose = require("mongoose");

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  new mongoose.Schema({
    transactionHash: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    IPFS: {
      type: String,
      required: true,
    },
  })
);

module.exports = TransactionHistory;
