const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendConfirmationEmail(userEmail, token) {
  const baseUrl = process.env.FRONTEND_PORT || "http://localhost:3000";
  const confirmationLink = `${baseUrl}/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userEmail,
    subject: "Xác nhận tài khoản của bạn",
    html: `
          <h4>Nhấn vào link bên dưới để kích hoạt tài khoản (link bên dưới sẽ hết hiệu lực sau 10 phút)</h4>
          <a href='${confirmationLink}'>Kích hoạt tài khoản</a>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Lỗi khi gửi email: ${error}`);
  }
}

async function sendRandomPassword(password, userEmail) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userEmail,
    subject: "Mật khẩu mới",
    html: `
      <p>Đây là mật khẩu mới của bạn:</p>
      <h5>${password}</h5>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Mật khẩu mới đã được gửi đến ${userEmail}`);
  } catch (err) {
    throw new Error("Không thể gửi email: " + err.message);
  }
}

module.exports = {
  sendConfirmationEmail,
  sendRandomPassword,
};
