const sendMail = require("../utils/sendMail");

const sendMeetingEmail = async (req, res) => {
  try {
    const { name, message, to, subject } = req.body;

    const mailOptions = {
      from: "shabujglobaleducation24@gmail.com",
      to: to,
      subject: subject,
      html: `<div>
    <div
        style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color: #0073e6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Shabuj Global Education</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333333;">Hello, ${name}</p>
            <p style="font-size: 16px; color: #333333;">${message}</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888888;">
            <p style="font-size: 14px; margin: 0;">© 2024 Shabuj Global Education. All rights reserved.</p>
            <p style="font-size: 14px; margin: 0;">759, Delvista Fuljhuri(Lift-5) Satmosjid Road, Dhanmondi, Dhaka-1207
            </p>
        </div>
    </div>
</div>`,
    };

    await sendMail(mailOptions, res);
    res
      .status(200)
      .json({ message: "Meeting email sent successfully", email: to });
  } catch (error) {
    res.status(500).json({ error: "Failed to send meeting email", email: to });
  }
};

module.exports = sendMeetingEmail;
