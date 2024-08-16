const router = require("express").Router();
const AccountController = require("../controller/accountController");
const MiddlewareController = require("../middleware/authMiddleware");

router.post("/register", AccountController.register);
router.post("/login", AccountController.login);
router.get("/confirm/:accessToken", AccountController.confirmAccount);
router.post(
  "/change_password",
  MiddlewareController.verifyToken,
  AccountController.changePassword
);
router.post(
  "/forgot_password",
  MiddlewareController.verifyToken,
  AccountController.forgotPassword
);
router.get("/logout", AccountController.logout);
module.exports = router;
