const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const email = require("../utilities/email.js");
const User = require("../db/models").User;
const payment = require("../utilities/payment.js");
const wikiController = require("./wikiController.js");

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
            passport.authenticate("local")(req, res, () => {
              email(newUser.username, newUser.email);
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
  },
  showAccount(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that.");
      res.redirect("/users/sign_in");
    } else {
      res.render("users/account");
    }
  },
  upgrade(req, res, next) {
    const token = req.body.stripeToken;
    payment(req.user.email, token, (err, charge) => {
      console.log(charge);
      if (charge["paid"] === true) {
        userQueries.upgradeUser(req, (err, user) => {
          if (err || user === null) {
            req.flash("error", err);
            res.redirect("/users/sign_up");
          } else {
            req.flash("notice", "Thanks for upgrading your account!");
            res.redirect("/");
          }
        });
      } else {
        req.flash("Your payment was not sucessful. Please try again");
        res.redirect("/users/account");
      }
    });
  },
  downgrade(req, res, next) {
    wikiController.makeAllPublic(req, res, next);
    userQueries.downgradeUser(req, (err, user) => {
      req.flash(
        "notice",
        "You have downgraded your account & your wikis are all public"
      );
      res.redirect("/");
    });
  }
};
