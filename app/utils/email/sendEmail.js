const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, template) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        secure: false,
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    console.log("email: ", email);
    transporter.sendMail(options(), (error, info) => {
      console.log('error: ', JSON.stringify(error));
      console.log('info: ', JSON.stringify(info));
    });
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
