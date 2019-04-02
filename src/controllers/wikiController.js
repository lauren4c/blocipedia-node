const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");

module.exports = {
  index(req, res, next) {
    wikiQueries.getAllPublicWikis((err, wikis) => {
      if (err) {
        res.redirect(500, "static/index");
      } else {
        res.render("wikis/index", { wikis });
      }
    });
  },
  showPrivate(req, res, next) {
    const authorized = new Authorizer(req.user).private();
    if (authorized) {
      wikiQueries.privateWikis(req.user, (err, wikis) => {
        if (err) {
          console.log(err);
          res.redirect(500, "static/index");
          req.flash("error", err);
        } else {
          res.render("wikis/private", { wikis });
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  new(req, res, next) {
    const authorized = new Authorizer(req.user).new();

    if (authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You are not authorized to do that.");
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
    const authorized = new Authorizer(req.user).show();
    if (authorized) {
      wikiQueries.getWiki(req.params.id, (err, wiki) => {
        if (err || wiki == null) {
          res.redirect(404, "/");
        } else {
          res.render("wikis/show", { wiki });
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis/index");
    }
  },
  update(req, res, next) {
    wikiQueries.updateWiki(req, req.body, (err, wiki) => {
      console.log(req.body);
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
      } else {
        res.render("wikis/edit", { wiki });
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
