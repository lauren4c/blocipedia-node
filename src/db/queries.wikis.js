const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Authorizer = require("../policies/wiki");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  getAllPublicWikis(callback) {
    return Wiki.findAll({
      where: {
        private: {
          [Op.not]: true
        }
      }
    })
      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        callback(err);
      });
  },

  privateWikis(user, callback) {
    return Wiki.findAll({
      where: {
        private: true,
        userId: user.id
      }
    })
      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  },

  addWiki(newWiki, callback) {
    return Wiki.create(newWiki)
      .then(wiki => {
        callback(null, wiki);
      })
      .catch(err => {
        callback(err);
      });
  },
  getWiki(id, callback) {
    return Wiki.findById(id)
      .then(wiki => {
        callback(null, wiki);
      })
      .catch(err => {
        callback(err);
      });
  },
  updateWiki(req, updatedWiki, callback) {
    return Wiki.findById(req.params.id)
      .then(wiki => {
        if (!wiki) {
          return callback("Wiki not found");
        }

        function isPrivate(checked) {
          if (checked) {
            return true;
          } else {
            return false;
          }
        }
        let updatedWiki = {
          title: req.body.title,
          body: req.body.body,
          userId: req.user.id,
          private: isPrivate(req.body.private)
        };
        const authorized = new Authorizer(req.user, wiki).update();
        if (authorized) {
          wiki
            .update(updatedWiki, {
              fields: Object.keys(updatedWiki)
            })
            .then(() => {
              callback(null, wiki);
            });
        } else {
          req.flash("notice", "You are not authorized to do that.");
          callback("Forbidden");
        }
      })
      .catch(err => {
        callback(err);
      });
  },
  deleteWiki(req, callback) {
    return Wiki.findById(req.params.id)
      .then(wiki => {
        const authorized = new Authorizer(req.user, wiki).destroy();
        if (authorized) {
          wiki.destroy().then(res => {
            callback(null, wiki);
          });
        } else {
          req.flash("notice", "You are not authorized to do that.");
          callback(401);
        }
      })
      .catch(err => {
        callback(err);
      });
  },
  makePublic(user, callback) {
    Wiki.update({ private: false }, { where: { userId: user.id } })
      .then(affectedRows => {
        return Wiki.findAll();
      })
      .then(wikis => {
        console.log(wikis);
        callback(null, wikis);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  }
};
