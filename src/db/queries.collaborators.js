const Collaborator = require("./models").Collaborator;
const User = require("./models").User;
const Wiki = require("./models").Wiki;
const Authorizer = require("../policies/collaborator");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
module.exports = {
  createCollaborator(newCollaborator, callback) {
    return Collaborator.create({
      collaboratorId: newCollaborator.collaboratorId,
      wikiOwner: newCollaborator.wikiOwner,
      wikiId: newCollaborator.wikiId
    })
      .then(collaborator => {
        callback(null, collaborator);
      })
      .catch(err => {
        callback(err);
      });
  },
  destroyCollaborator(req, callback) {
    const id = parseInt(req.body.collaboratorId, 10);
    return Collaborator.findOne({
      where: {
        wikiId: req.params.wikiId,
        wikiOwner: req.user.id,
        collaboratorId: id
      }
    })
      .then(collaborator => {
        if (!collaborator) {
          return callback("Collaborator not found");
        }

        collaborator
          .destroy()
          .then(res => {
            callback(null, collaborator);
          })
          .catch(err => {
            callback(err);
          });
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  },
  checkCollaborator(wikiId, userId, callback) {
    Collaborator.findOne({
      where: {
        wikiId: wikiId,
        [Op.or]: [{ wikiOwner: userId }, { collaboratorId: userId }]
      }
    })
      .then(collaborator => {
        callback(null, collaborator);
      })
      .catch(err => {
        callback(err);
      });
  }
};
