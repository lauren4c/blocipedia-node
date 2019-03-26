"use strict";
module.exports = (sequelize, DataTypes) => {
  const Wiki = sequelize.define(
    "Wiki",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      private: DataTypes.BOOLEAN
    },
    {}
  );
  Wiki.associate = function(models) {
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
  };
  return Wiki;
};
