module.exports = class ApplicationPolicy {
  // #1
  constructor(user, record) {
    this.user = user;
    this.record = record;
  }

  _isPremium() {
    return this.user && this.user.role === 1;
  }

  _isStandard() {
    return this.user && this.user.role === 0;
  }

  new() {
    return !!this.user;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    return (
      this.new() && this.record && (this._isPremium() || this._isStandard())
    );
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
};
