"use strict";

const faker = require("faker");

let wikis = [];

for (let i = 1; i <= 10; i++) {
  wikis.push({
    title: faker.hacker.phrase(),
    body: faker.lorem.sentence(),
    userId: 325,
    private: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Wikis", wikis, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Wikis", null, {});
  }
};
