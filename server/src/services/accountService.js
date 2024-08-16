const Account = require("../model/accountSchema");
const bcrypt = require("bcrypt");
const Role = require("../model/roleSchema");
const mailService = require("../configs/mailConfig");
const generateRandomString = require("../configs/generateRandom");
const jwt = require("jsonwebtoken");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../services/jwtService");
require("dotenv").config();

async function register(
  username,
  email,
  password,
  avatar = "defaultAvatar",
  status
) {
  try {
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return { status: 400, msg: "Email đã tồn tại, hãy sử dụng email khác." };
    }

    const defaultRole = await Role.findOne({ name: "customer" });
    if (!defaultRole) {
      return { status: 500, msg: "Role 'customer' không tồn tại" };
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SECRET_KEY)
    );
    const account = new Account({
      username,
      email,
      password: hashedPassword,
      avatar,
      role: defaultRole._id,
      status,
    });

    await account.save();
    const accessAccountToken = jwt.sign(
      { id: account._id },
      process.env.SECRET_KEY_ACCESS_ACCOUNT,
      { expiresIn: "10m" }
    );
    await mailService.sendConfirmationEmail(email, accessAccountToken);

    return { status: 200, msg: "Đăng ký thành công." };
  } catch (error) {
    console.error(error);
    return { status: 500, msg: "Đã xảy ra lỗi trong quá trình đăng ký." };
  }
}

async function login(email, password) {
  try {
    const account = await Account.findOne({ email });
    if (!account) {
      return { status: 400, msg: "Không tìm thấy email" };
    }

    const passwordMatch = await bcrypt.compare(password, account.password);
    if (!passwordMatch) {
      return { status: 400, msg: "Mật khẩu cũ không chính xác" };
    }

    const accessToken = createAccessToken(account._id, email);
    const refreshToken = createRefreshToken(account._id);

    return { status: 200, accessToken, refreshToken };
  } catch (error) {
    console.error(`Failed to log in: ${error}`);
    return { status: 500, msg: "Đã xảy ra lỗi trong quá trình đăng nhập" };
  }
}

async function confirmAccount(accessToken) {
  try {
    const { id } = jwt.verify(
      accessToken,
      process.env.SECRET_KEY_ACCESS_ACCOUNT
    );
    await updateStatusAccount(id);
    return { status: 200, msg: "Xác thực tài khoản thành công." };
  } catch (error) {
    console.error(`Failed to confirm account: ${error}`);
    return { status: 400, msg: "Token này đã hết hạn." };
  }
}

async function updateStatusAccount(accountId) {
  try {
    await Account.findByIdAndUpdate(accountId, { status: "active" });
  } catch (err) {
    throw new Error("Không thể cập nhật trạng thái tài khoản: " + err.message);
  }
}

async function renderNewPassword(email) {
  try {
    const account = await Account.findOne({ email }).populate("Role").exec();
    if (!account) {
      throw new Error("Tài khoản không tồn tại!");
    }

    const newPassword = generateRandomString(8);
    account.password = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SECRET_KEY)
    );

    await account.save();
    return newPassword;
  } catch (err) {
    throw new Error("Không thể tạo mật khẩu mới: " + err.message);
  }
}

async function changePassword(email, oldPassword, newPassword) {
  try {
    console.log(`Attempting to change password for email: ${email}`);

    // Find the account by email
    const account = await Account.findOne({ email });
    if (!account) {
      console.log("Account not found.");
      return {
        status: 400,
        msg: "Không tìm thấy tài khoản với email đã cung cấp.",
      };
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, account.password);
    if (!isPasswordValid) {
      console.log("Old password is incorrect.");
      return {
        status: 400,
        msg: "Mật khẩu cũ không chính xác.",
      };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SECRET_KEY)
    );

    // Update the password
    await Account.findOneAndUpdate(
      { email },
      { password: hashedNewPassword },
      { new: true }
    );

    console.log("Password updated successfully.");
    return {
      status: 200,
      msg: "Đổi mật khẩu thành công.",
    };
  } catch (err) {
    console.error(`Error changing password: ${err.message}`);
    return {
      status: 500,
      msg: "Không thể cập nhật mật khẩu tài khoản: " + err.message,
    };
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("refreshToken", { httpOnly: true, maxAge: 0 });
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error(`Error during logout: ${error}`);
    return res.status(500).json({ message: "An error occurred during logout" });
  }
}

module.exports = {
  register,
  confirmAccount,
  login,
  logout,
  changePassword,
  renderNewPassword,
};
