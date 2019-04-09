const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const User = require("../db/models").User;
const markdown = require("markdown").markdown;
const collaboratorQueries = require("../db/queries.collaborators.js");

module.exports = {
  index(req, res, next) {
    if (!req.user) {
      wikiQueries.getAllPublicWikis((err, wikis) => {
        if (err) {
          res.redirect(500, "static/index");
        } else {
          res.render("wikis/index", { wikis });
        }
      });
    } else {
      wikiQueries.privateWikis(req.user.id, (err, wikis) => {
        if (err) {
          console.log(err);
          res.redirect(500, "static/index");
          req.flash("error", err);
        } else {
          res.render("wikis/index", { wikis });
        }
      });
    }
  },

  new(req, res, next) {
    const authorized = new Authorizer(req.user).new();
    if (authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You must have an account to create new wikis.");
      res.redirect(`/wikis/index`);
    }
  },
  create(req, res, next) {
    const authorized = new Authorizer(req.user).create();

    function isPrivate(checked) {
      return checked ? true : false;
    }

    if (authorized) {
      let newWiki = {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private: isPrivate(req.body.private)
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        console.log(newWiki);

        if (err) {
          res.redirect(500, "/wikis/new");
        } else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis/index");
    }
  },

  show(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(404, "/");
      } else if (wiki.private === false) {
        console.log("this is a public wiki ");
        res.render("wikis/show", { wiki, markdown });
      } else if (wiki.private === true) {
        collaboratorQueries.checkCollaborator(
          wiki.id,
          req.user.id,
          (err, collaborator) => {
            console.log(err, collaborator);
            if (err || collaborator === null) {
              req.flash(
                "notice",
                "You do not have permission to view this wiki."
              );
              res.redirect("/wikis");
            } else {
              res.render("wikis/show", { wiki, markdown });
            }
          }
        );
      } else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect(`/wikis/index`);
      }
    });
  },
  update(req, res, next) {
    wikiQueries.updateWiki(req, req.body, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(401, `/wikis/${req.params.id}/edit`);
      } else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },
  destroy(req, res, next) {
    wikiQueries.deleteWiki(req, (err, wiki) => {
      if (err) {
        res.redirect(
          typeof err === "number" ? err : 500,
          `/wikis/${req.params.id}`
        );
      } else {
        res.redirect(303, "/wikis");
      }
    });
  },

  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(404, "/");
      } else if (wiki.private === false) {
        res.render("wikis/edit", { wiki });
      } else if (wiki.private === true) {
        collaboratorQueries.checkCollaborator(
          wiki.id,
          req.user.id,
          (err, collaborator) => {
            if (err || !collaborator) {
              req.flash(
                "notice",
                "You do not have permission to view this wiki."
              );
              res.redirect("/wikis");
            } else {
              res.render("wikis/edit", { wiki });
            }
          }
        );
      } else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect(`/wikis/index`);
      }
    });
  },
  makeAllPublic(req, res, next) {
    wikiQueries.makePublic(req.user, (err, wikis) => {
      if (err || wiki == null) {
        res.redirect(401, `/wikis/`);
      }
    });
  }
};
