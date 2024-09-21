const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (mailOptions, res) => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to send email" });
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).send({ message: "Email sent successfully" });
    }
  });
};

module.exports = sendMail;
