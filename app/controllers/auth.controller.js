const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const ResetToken = db.resetToken;

const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

exports.signup = async (req, res) => {
  const user = new User({
    avata: req.body.avata,
    first: req.body.first,
    last: req.body.last,
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    createdAt: new Date(),
    walletId: req.body.wallet
  });

  // check email
  let old = await User.findOne({ email: req.body.email });
  if( old ) {
    res.send({ success: false, message: "Email already exist" });
    return;
  }

  // check username
  old = await User.findOne({ username: req.body.username });
  if( old ) {
      res.send({ success: false, message: "Username already exist" });
      return;
  }

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ success: true, message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ success: true, message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.send({ success: false, message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.send({
          success: false,
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var tokendate = new Date();

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        success: true,
        id: user._id,
        avata: user.avata,
        firstname: user.first,
        lastname: user.last,
        username: user.username,
        email: user.email,
        wallet: user.walletId,
        roles: authorities,
        accessToken: token,
        genTokenDate: tokendate
      });
    });
};

exports.signin_admin = (req, res) => {
    User.findOne({
      username: req.body.username
    })
      .populate("roles", "-__v")
      .exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
  
        if (!user) {
          return res.send({ success: false, message: "User Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          return res.send({
            success: false,
            accessToken: null,
            message: "Invalid Password!"
          });
        }

        if( user.roles.findIndex(item => item.name.toUpperCase() === 'ADMIN') == -1 ) {
            return res.send({
                success: false,
                accessToken: null,
                message: "No Admin Access Control!"
              });
        }
  
        // opt
        const secret = speakeasy.generateSecret({length: 20});

        var temp = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32'
        });
        console.log('token: ', temp);
		
		sendEmail(
			user.email,
			"Two-factor Authentication",
			{
			  name: user.username,
			  topt: temp,
			},
			"./template/receiveTOPT.handlebars"
		);

        let twofactor = {};
        QRCode.toDataURL(secret.otpauth_url, async (err, data_url)=>{
            //save to logged in user.
            twofactor = {
                tempSecret: secret.base32,
                dataURL: data_url,
                otpURL: secret.otpauth_url
            }

            await User.updateOne(
                { _id: user._id },
                { $set: 
                    { "twofactor.tempSecret": twofactor.tempSecret, "twofactor.dataURL": twofactor.dataURL, "twofactor.otpURL": twofactor.otpURL } 
                }
            );

            res.status(200).send({
                success: true,
                id: user._id,
                twofactor: twofactor
            });
        });
      });
};

exports.twofactorVerify = async ( req, res ) => {
    const otp = req.body.token;
    const userId = req.body.id;

    const user = await User.findOne({ _id: userId }).populate("roles", "-__v");
    if( !user ) {
        return res.send({ success: false, message: "Email does not exist" });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twofactor.tempSecret, //secret of the logged in user
        encoding: 'base32',
        token: otp
    });

    if(!verified){
        return res.send({ success: false, message: "Invalid token, verification failed" });
    }

    // -------- send user action ----------
    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    var tokendate = new Date();

    var authorities = [];

    for (let i = 0; i < user.roles.length; i++) {
      authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
    }
    res.status(200).send({
        success: true,
        id: user._id,
        avata: user.avata,
        firstname: user.first,
        lastname: user.last,
        username: user.username,
        email: user.email,
        wallet: user.walletId,
        roles: authorities,
        accessToken: token,
        genTokenDate: tokendate,
        twofactor: user.twofactor,
    });
}

exports.requestPasswordReset = async (req, res) => {

    const user = await User.findOne({ username: req.body.username, email: req.body.email });
    if( !user ) {
        res.send({ success: false, message: "User info incorrect!" });
        return;
    }

    const token = await ResetToken.findOne({ userId: user._id });
    if( token ) await token.deleteOne();

    const resToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resToken, Number(bcryptSalt));

    await new ResetToken({
        userId: user._id,
        token: hash,
        createdAt: Date.now()
    }).save();

    const link = `${clientURL}/passwordReset?token=${resToken}&id=${user._id}`;

    sendEmail(
        user.email,
        "Truhelix.com",
        {
          name: user.username,
          link: link,
        },
        "./template/requestResetPassword.handlebars"
    );
    
    res.send({ success: true });
};

exports.resetPassword = async( req, res ) => {
    const userId = req.body.userId;
    const token = req.body.token;
    const password = req.body.password;

    const passwordResetToken = await ResetToken.findOne({ userId });

    if( !passwordResetToken ) {
        res.send({ success: false, message: "Invalid or expired password reset token" });
        return;
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if( !isValid ) {
        res.send({ success: false, message: "Invalid or expired password reset token" });
        return;
    }

    const hash = bcrypt.hashSync(password, 8);

    await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    );

    res.send({ success: true });
}