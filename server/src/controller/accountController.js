const accountService = require("../services/accountService");
const jwtService = require("../services/jwtService");
const mailService = require("../configs/mailConfig");
const validator = require("validator");
require("dotenv").config();

async function register(req, res) {
  try {
    const { username, email, password, avatar, status } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Tên người dùng, email và mật khẩu là bắt buộc." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Địa chỉ email không hợp lệ." });
    }

    if (password.length < 8) {
      return res.status(400).json({ msg: "Mật khẩu phải có ít nhất 8 ký tự." });
    }

    // Proceed with the service call
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email và mật khẩu là bắt buộc." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Địa chỉ email không hợp lệ." });
    }

    // Proceed with the service call
    const loginResult = await accountService.login(email, password);
    const { status, accessToken, refreshToken, user } = loginResult;

    if (status !== 200) {
      throw new Error("Email hoặc password không đúng");
    }

    if (!accessToken || !refreshToken) {
      throw new Error("Failed to generate tokens");
    }

    jwtService.sendRefreshToken(res, refreshToken);

    if (!user) {
      throw new Error("User data is not available");
    }

    res.status(200).json({
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      accessToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function confirmAccount(req, res) {
  const { accessToken } = req.body; // Cập nhật từ params thành body

  // Validation
  if (!accessToken) {
    return res.status(400).json({ msg: "Access token là bắt buộc." });
  }

  try {
    const result = await accountService.confirmAccount(accessToken);
    res.status(result.status).json({ msg: result.msg });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ msg: "Email là bắt buộc." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Địa chỉ email không hợp lệ." });
  }

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
  const { email, oldPassword, newPassword } = req.body;

  // Validation
  if (!email || !oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ msg: "Email, mật khẩu cũ và mật khẩu mới là bắt buộc." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Địa chỉ email không hợp lệ." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ msg: "Mật khẩu mới phải có ít nhất 8 ký tự." });
  }

  try {
    const result = await accountService.changePassword(
      email,
      oldPassword,
      newPassword
    );
    res.status(result.status).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function logout(req, res) {
  try {
    await accountService.logout(req, res);
    res.status(200).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    // Đảm bảo rằng bạn không gửi phản hồi nếu đã gửi một lần
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
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
