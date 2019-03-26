const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const email = require("../utilities/email.js");
const User = require("../db/models").User;

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
    User.findOne({ where: { email: newUser.email } }).then(user => {
      if (user) {
        const errors = [
          {
            location: "body",
            param: "email",
            msg: "is already in use",
            value: ""
          }
        ];
        req.flash("error", errors);
        res.redirect("/users/sign_up");
      } else {
        userQueries.createUser(newUser, (err, user) => {
          if (err) {
            req.flash("error", err);
            res.redirect("/users/sign_up");
          } else {
            // #3
            passport.authenticate("local")(req, res, () => {
              req.flash("notice", "You've successfully signed in!");
              res.redirect("/");
            });
          }
        });
      }
    });
  },
  signInForm(req, res, next) {
    res.render("users/sign_in");
  },
  signIn(req, res, next) {
    passport.authenticate("local")(req, res, () => {
      if (!req.user) {
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    });
  },
  signOut(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  }
};
