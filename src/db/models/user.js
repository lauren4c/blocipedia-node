"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: { msg: "must be a valid email" }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {}
  );
  User.associate = function(models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });
    User.hasMany(models.Collaborator, {
      foreignKey: "wikiOwner",
      as: "collaboratorOwner"
    });
    User.hasMany(models.Collaborator, {
      foreignKey: "collaboratorId",
      as: "collaborator"
    });
  };
  return User;
};
