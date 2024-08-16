const accountService = require("../services/accountService");
const jwtService = require("../services/jwtService");
const mailService = require("../configs/mailConfig");
require("dotenv").config();
async function register(req, res) {
  try {
    const { username, email, password, avatar, status } = req.body;
    const account = await accountService.register(
      username,
      email,
      password,
      avatar,
      status
    );
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { status, accessToken, refreshToken } = await accountService.login(
      email,
      password
    );

    if (status !== 200) {
      throw new Error("Invalid email or password");
    }

    if (!accessToken || !refreshToken) {
      throw new Error("Failed to generate tokens");
    }

    jwtService.sendRefreshToken(res, refreshToken);

    res.status(200).json({ email, accessToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function confirmAccount(req, res) {
  const { accessToken } = req.params;
  try {
    const result = await accountService.confirmAccount(accessToken);
    res.status(200).send(result); // Always use 200 if you're sending a success message
  } catch (error) {
    res.status(400).json({ message: error.message }); // Ensure a valid status is always used
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const newPassword = await accountService.renderNewPassword(email);
    await mailService.sendRandomPassword(newPassword, email);
    return res
      .status(200)
      .json({ msg: "Mật khẩu mới đã được gửi đến email của bạn." });
  } catch (err) {
    return res.status(500).json({ err: err.toString() });
  }
}

async function changePassword(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const result = await accountService.changePassword(
      email,
      oldPassword,
      newPassword
    );

    // Use the status and message from the service
    res.status(result.status).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function logout(req, res) {
  try {
    await accountService.logout(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
  confirmAccount,
  login,
  logout,
  changePassword,
  forgotPassword,
};
