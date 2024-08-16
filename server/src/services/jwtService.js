require("dotenv").config();
const jwt = require("jsonwebtoken");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const accessTokenExpiry = "15m"; // Access token expires in 15 minutes
const refreshTokenExpiry = "7d"; // Refresh token expires in 7 days

function createAccessToken(userId, email) {
  return jwt.sign({ userId, email }, accessTokenSecret, {
    expiresIn: accessTokenExpiry,
  });
}

function createRefreshToken(userId) {
  return jwt.sign({ userId }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry,
  });
}

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    return decoded; // Trả về toàn bộ payload, bao gồm userId và email
  } catch (error) {
    console.error("Xác thực token không thành công:", error);
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, refreshTokenSecret);
  } catch (error) {
    console.error("Refresh Token verification failed:", error);
    return null;
  }
}

function sendRefreshToken(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true, // Prevent JavaScript access to the cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendRefreshToken,
};
