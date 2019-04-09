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
      return this.new() && this._isOwner();
    } else {
      return this.new();
    }
  }
  update() {
    if (this.record.private == true) {
      return this.new() && this._isOwner();
    } else {
      return this.new();
    }
  }

  destroy() {
    if (this.record.private == true) {
      return this.new() && this._isOwner();
    } else {
      return this.new();
    }
  }

  private() {
    return this.new() && (this._isPremium() || this._isAdmin());
  }

  showPrivate() {
    if (this.record.private == true) {
      return this._isOwner() || this._isAdmin();
    } else {
      return this.show();
    }
  }
};
