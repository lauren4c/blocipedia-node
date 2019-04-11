const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const Collaborator = require("../../src/db/models").Collaborator;

describe("routes : collaborators", () => {
  beforeEach(done => {
    this.wiki;
    this.user;
    this.collaborator;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "SteveTheCat",
        email: "testuser@test.com",
        password: "IAmACat",
        role: 1
      }).then(user => {
        this.premiumUser = user;

        User.create({
          username: "SammyTheDog",
          email: "sammy@woof.com",
          password: "IAmADog",
          role: 0
        }).then(user => {
          this.standardUser = user;

          Wiki.create(
            {
              title: "What's for Dinner tonight?",
              body: "The humans will probably give us dry food again.",
              userId: this.premiumUser.id,
              private: true
            },
            {
              include: {
                model: Collaborator,
                as: "collaborators"
              }
            }
          ).then(wiki => {
            this.wiki = wiki;

            Collaborator.create({
              collaboratorId: this.standardUser.id,
              wikiId: this.wiki.id,
              wikiOwner: this.premiumUser.id
            }).then(collaborator => {
              console.log(collaborator);
              this.collaborator = collaborator;
              done();
            });
          });
        });
      });
    });
  });

  //tests for Premium User
  describe("Premium User Adding and removing collaborators", () => {
    beforeEach(done => {
      User.create({
        username: "user",
        email: "standard@user.com",
        password: "123456",
        role: 0
      }).then(user => {
        this.user = user;
      });
      request.get(
        {
          // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            email: this.premiumUser.email,
            userId: this.premiumUser.id,
            username: this.premiumUser.username
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /wikis/:id/collaborators/create", () => {
      it("should create a collaborator for the wiki", done => {
        const options = {
          url: `${base}${this.wiki.id}/collaborators/create`,
          form: {
            collaboratorId: this.user.id,
            wikiId: this.wiki.id,
            wikiOwner: this.premiumUser.id
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Collaborator.findOne({
            where: {
              collaboratorId: this.user.id,
              wikiId: this.wiki.id,
              wikiOwner: this.premiumUser.id
            }
          })
            .then(collaborator => {
              console.log("this is the new collaborator " + collaborator);
              expect(collaborator).not.toBeNull(); // confirm that a favorite was created
              expect(collaborator.wikiId).toBe(this.wiki.id);
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /wikis/:id/collaborators/destroy", () => {
      it("should destroy a collaborator", done => {
        Collaborator.findOne({
          where: {
            collaboratorId: this.standardUser.id,
            wikiId: this.wiki.id,
            wikiOwner: this.premiumUser.id
          }
        }).then(collaborator => {
          const options = {
            url: `${base}${this.wiki.id}/collaborators/destroy`,
            form: {
              collaboratorId: this.standardUser.id,
              wikiId: this.wiki.id,
              wikiOwner: this.premiumUser.id
            }
          };

          request.post(options, (err, res, body) => {
            Collaborator.findOne({
              where: {
                id: this.collaborator.id
              }
            })
              .then(collaborator => {
                expect(collaborator).toBeNull();
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
    });
  });
});
