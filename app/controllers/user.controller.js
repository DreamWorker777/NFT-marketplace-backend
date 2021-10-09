const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

const sortCompare = key => (a, b) => {
    const fieldA = a[key]
    const fieldB = b[key]

    let comparison = 0
    if (fieldA > fieldB) {
        comparison = 1
    } else if (fieldA < fieldB) {
        comparison = -1
    }
    return comparison
}

const db = require("../models");
const User = db.user;
const Role = db.role;
const SiteInfo = db.siteInfo;
const BadWordList = db.badWordList;
const TransactionHistory = db.transactionHistory;

const bcrypt = require("bcryptjs");
const { transactionHistory } = require("../models")

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.changeImage = async (req, res) => {
  const userid = req.userId;

  const myquery = { _id: userid };
  const newvalues = {$set: {avata: req.body.profileImg} };
  const options = { new: true };
  const result = await User.findOneAndUpdate(myquery, newvalues, options);
  
  res.status(200).send({
    id: result._id,
    avata: result.avata,
    firstname: result.first,
    lastname: result.last,
    username: result.username,
    email: result.email,
  })
};

exports.updateProfileDetail = async (req, res) => {
  const userid = req.userId;

  const userQuery = { _id: userid };
  const newUpdate = { $set: { username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email } };
  const options = { new: true };
  const result = await User.findOneAndUpdate(userQuery, newUpdate, options);

  res.status(200).send({
    id: result._id,
    avata: result.avata,
    firstname: result.first,
    lastname: result.last,
    username: result.username,
    email: result.email,
  })
}

exports.userBoard = async (req, res) => {
  const userId = req.userId;
  let user = await User.findById(userId).exec();
  res.status(200).send({user: user});
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getAllusers = async (req, res) => {
    const allUsers = await User.find().exec();
    const allRoles = await Role.find().exec();

    // query Params
    const {
        q = '',
        perPage = 10,
        page = 1,
        sortBy = 'id',
        sortDesc = false,
    } = req.query;

    const queryLowered = q.toLowerCase()

    const filteredData = allUsers.filter( user => 
        (user.username.toLowerCase().includes(queryLowered))
    )

    let sortedData = filteredData.sort(sortCompare(sortBy))

    if (sortDesc === 'true') {
        sortedData.reverse()
    }

    const users = paginateArray(sortedData, perPage, page).map((user) => {
        let temp = user;
        let roles = user.roles;
        for( let i = 0; i < roles.length; i++ ) {
            allRoles.forEach(role => {
                if( role._id.toString() == roles[i].toString() ) {
                    roles[i] = role.name;
                }
            });
        }

        temp.roles = roles;
        return temp;
    });
    res.status(200).send({allUsers: users, total: filteredData.length});
}

exports.resetPassword = async (req, res) => {
    const user  = req.body.user;
    const userQuery = { _id: user.id }
    const newValues = { $set: { password: bcrypt.hashSync(user.password, 8) } }

    const result = await User.findOneAndUpdate(userQuery, newValues);

    res.status(200).send({
        success: true
    })
}

exports.getFeePercent = async(req, res) => {
    const site_info = await SiteInfo.find().exec();
    res.status(200).send({
        percent: site_info[0].feePercent
    })
}

exports.setFeePercent = async ( req, res ) => {
    const site_info = await SiteInfo.find().exec();
    const feePercent = req.body.feePercent;

    const myQuery = { _id: site_info[0]._id };
    const newValues = { feePercent: feePercent };

    await SiteInfo.updateOne(myQuery, newValues);

    return res.status(200).send({
        success: true
    })
}

exports.addNewBadWord = async ( req, res ) => {
    const word = req.body.word;

    const old = await BadWordList.findOne({ content: word });
    if( old ) {
        return res.status(200).send({
            success: false,
            message: 'Word already exists!'
        })
    }

    await new BadWordList({
        content: word,
        user_id: req.userId
    }).save();

    const allWords = await BadWordList.find().populate('user_id', "-__v").exec();

    return res.status(200).send({
        success: true,
        all: allWords,
    })
}

exports.getBadWordList = async ( req, res ) => {
    const allWords = await BadWordList.find().populate('user_id', "-__v").exec();

    return res.status(200).send({
        success: true,
        all: allWords,
    })
}

exports.saveTransactionHistory = async ( req, res ) => {
    await new TransactionHistory({
        transactionHash: req.body.transactionHash,
        from: req.body.from,
        to: req.body.to,
        amount: req.body.amount,
        type: req.body.type,
        IPFS: req.body.IPFS,
    }).save();

    return res.status(200).send({});
}

exports.getAllTransactionHistory = async (req, res) => {
    const transactions = await TransactionHistory.find().exec();

    return res.status(200).send({ transactions });
}