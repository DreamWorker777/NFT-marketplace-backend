const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.nftlink = require("./nftlink.model");
db.resetToken = require("./resetToken.model");
db.siteInfo = require("./siteInfo.model");
db.badWordList = require('./badWordList.model');
db.chatHistory = require('./chatHistory.model');

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;