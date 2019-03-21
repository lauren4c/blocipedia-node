const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const email = require("../utilities/email.js");

module.exports = {
  signUp(req, res, next) {
    res.render("users/sign_up");
  },
  create(req, res, next) {
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
    userQueries.createUser(newUser, (err, user) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/users/sign_up");
      } else {
        passport.authenticate("local")(req, res, () => {
          email(newUser.username, newUser.email);
          req.flash("notice", "You've successfully signed in!");
          res.redirect("/");
        });
      }
    });
  }
};