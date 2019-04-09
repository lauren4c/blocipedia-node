const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("Collaborator", () => {
  beforeEach(done => {
    this.wiki;
    this.user;
    this.collaborator;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "SteveTheCat",
        email: "testuser@test.com",
        password: "IAmACat"
      }).then(user => {
        this.user = user1; //store the user

        User.create({
          username: "SammyTheDog",
          email: "sammy@woof.com",
          password: "IAmADog"
        }).then(user => {
          this.user = user2; //store the user

          Wiki.create({
            title: "What's for Dinner tonight?",
            body: "The humans will probably give us dry food again.",
            userId: this.user1.id,
            private: true
          }).then(wiki => {
            this.wiki = wiki;
            done();
          });
        });
      });
    });
    describe("#create()", () => {
      it("should create a collaboration between a private wiki and a user", done => {
        Collaborator.create({
          wikiOwner: this.user1.id,
          collaboratorId: this.user2.id,
          wikiId: this.wiki.id
        })
          .then(collaborator => {
            expect(collaborator.wikiOwner).toBe(this.user1.id);
            expect(collaborator.collaboratorId).toBe(this.user2.id);
            expect(collaborator.wikiId).toBe(this.wiki.id);

            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
      it("should not create a collaborator without a collaboratorId", done => {
        Collaborator.create({
          wikiOwner: this.user1.id
        })
          .then(collaborator => {
            // the code in this block will not be evaluated since the validation error
            // will skip it. Instead, we'll catch the error in the catch block below
            // and set the expectations there

            done();
          })
          .catch(err => {
            expect(err.message).toContain("CollaboratorId cannot be null");
            expect(err.message).toContain("WikiId cannot be null");
            done();
          });
      });
    });
  });
});
