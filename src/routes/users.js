const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/sign_up", userController.signUp);
router.post("/users", validation.validateUserSignUp, userController.create);
router.get("/users/sign_in", userController.signInForm);
router.post(
  "/users/sign_in",
  validation.validateUserSignIn,
  userController.signIn
);
router.get("/users/sign_out", userController.signOut);
router.post("/users/upgrade", userController.upgrade);
router.get("/users/account", userController.showAccount);
router.post("/users/downgrade", userController.downgrade);

module.exports = router;
