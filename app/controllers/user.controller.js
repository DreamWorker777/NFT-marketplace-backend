const db = require("../models");
const User = db.user;
const Role = db.role;

const bcrypt = require("bcryptjs");

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
  console.log(req.body);
  const userQuery = { _id: userid };
  const newUpdate = { $set: { username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email } };
  const options = { new: true };
  const result = await User.findOneAndUpdate(userQuery, newUpdate, options);
  console.log(result)

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
  console.log(user);
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

  const users = allUsers.map((user) => {
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
  res.status(200).send({allUsers: users});
}

exports.resetPassword = async (req, res) => {
    const user  = req.body.user;
    const userQuery = { _id: user.id }
    const newValues = { $set: { password: bcrypt.hashSync(user.password, 8) } }

    const result = await User.findOneAndUpdate(userQuery, newValues);
    console.log(result)

    res.status(200).send({
        success: true
    })
}
