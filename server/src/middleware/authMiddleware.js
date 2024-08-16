const jwt = require("jsonwebtoken");
const Account = require("../model/accountSchema");

// Middleware to verify token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.status(401).json({ message: "Authentication failed" });
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json({ message: "No token provided" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.toString() });
  }
}

// Middleware to verify admin role
async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, user) => {
          if (err) {
            return res.status(400).json({ msg: "Authentication failed" });
          }
          const userDb = await Account.findById(user.id).populate("role");
          if (userDb?.role?.name === "admin") {
            req.user = user;
            return next();
          } else {
            return res.status(400).json({ msg: "Authentication failed" });
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Authentication failed" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.toString() });
  }
}

// Middleware to verify admin and employee roles
async function verifyAdminAndEmployee(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, user) => {
          if (err) {
            return res.status(400).json({ msg: "Authentication failed" });
          }
          const userDb = await Account.findById(user.id).populate("role");
          if (
            userDb?.role?.name === "admin" ||
            userDb?.role?.name === "employee"
          ) {
            req.user = user;
            return next();
          } else {
            return res.status(400).json({ msg: "Authentication failed" });
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Authentication failed" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.toString() });
  }
}

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyAdminAndEmployee,
};
