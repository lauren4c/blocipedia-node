"use strict";

const faker = require("faker");
let users = [
  {
    id: 5,
    username: faker.lorem.word(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 6,
    username: faker.lorem.word(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
