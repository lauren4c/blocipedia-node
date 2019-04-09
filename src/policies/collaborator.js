const ApplicationPolicy = require("./application");

module.exports = class CollaboratorPolicy extends ApplicationPolicy {
  create() {
    return this._isPremium() || this._isAdmin();
  }

  destroy() {
    return this.create();
  }
};
