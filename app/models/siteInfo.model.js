const mongoose = require("mongoose");

const SiteInfo = mongoose.model(
  "SiteInfo",
  new mongoose.Schema({
    feePercent: mongoose.Schema.Types.Number
  })
);

module.exports = SiteInfo;
