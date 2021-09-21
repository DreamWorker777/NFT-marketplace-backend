const mongoose = require("mongoose");

const Nftlink = mongoose.model(
    "Nftlink",
    new mongoose.Schema({
        datalink: String,
        publickey: String,
        privatekey: String,
        byuser: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
            }
          ]
    })
);

module.exports = Nftlink;