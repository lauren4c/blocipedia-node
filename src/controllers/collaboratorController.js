const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require("../policies/collaborator");
const Collaborator = require("../db/models").Collaborator;
const User = require("../db/models").User;

module.exports = {
  create(req, res, next) {
    let newCollaborator = {
      collaboratorId: req.body.collaboratorId,
      wikiId: req.params.wikiId,
      wikiOwner: req.user.id
    };

    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(user => {
      if (!user) {
        req.flash("notice", "Please enter a valid user ID.");
        res.redirect(req.headers.referer);
      } else {
        Collaborator.findOne({
          where: {
            wikiId: req.params.wikiId,
            wikiOwner: req.user.id,
            collaboratorId: req.body.collaboratorId
          }
        }).then(collaborator => {
          if (collaborator) {
            req.flash("notice", "Already a collaborator");
            res.redirect(req.headers.referer);
          } else {
            collaboratorQueries.createCollaborator(
              newCollaborator,
              (err, collaborator) => {
                if (err) {
                  console.log(err);
                  req.flash("error", err);
                  res.redirect(req.headers.referer);
                } else {
                  req.flash("notice", "You've added a collaborator");
                  res.redirect(req.headers.referer);
                }
              }
            );
          }
        });
      }
    });
  },

  destroy(req, res, next) {
    collaboratorQueries.destroyCollaborator(req, (err, collaborator) => {
      if (err) {
        res.redirect(req.headers.referer);
      } else {
        req.flash("notice", "You removed a collaborator.");
        res.redirect(req.headers.referer);
      }
    });
  }
};
