const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {
  new() {
    return !!this.user;
  }

  create() {
    return this.new();
  }

  edit() {
    if (this.record.private == true) {
      return this.new() && this._isOwner();
    } else {
      return this.new() && this.record;
    }
  }

  update() {
    if (this.record.private == true) {
      return this.edit() && this._isOwner();
    } else {
      return this.edit();
    }
  }

  destroy() {
    if (this.record.private == true) {
      return this.update() && this._isOwner();
    } else {
      return this.update();
    }
  }

  private() {
    return this.new() && (this._isPremium() || this._isAdmin());
  }

  showPrivate() {
    return this.new() && this._isOwner();
  }
};
