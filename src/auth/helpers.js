const bcrypt = require("bcryptjs");

module.exports = {
  // #1
  ensureAuthenticated(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that.");
      return res.redirect("/users/sign_up"); //change to sign_in after created
    } else {
      next();
    }
  },

  // #2
  comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }
};
