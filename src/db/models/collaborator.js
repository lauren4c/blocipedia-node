"use strict";
module.exports = (sequelize, DataTypes) => {
  const Collaborator = sequelize.define(
    "Collaborator",
    {
      collaboratorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wikiId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wikiOwner: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {}
  );
  Collaborator.associate = function(models) {
    Collaborator.belongsTo(models.User, {
      foreignKey: "wikiOwner",
      onDelete: "CASCADE"
    });
    Collaborator.belongsTo(models.User, {
      foreignKey: "collaboratorId",
      onDelete: "CASCADE"
    });
    Collaborator.belongsTo(models.Wiki, {
      foreignKey: "wikiId",
      onDelete: "CASCADE"
    });
  };
  return Collaborator;
};
