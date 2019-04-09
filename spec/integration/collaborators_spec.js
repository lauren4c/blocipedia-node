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
              this.collaborator = collaborator;
              done();
            });
          });
        });
      });
    });
  });
  // describe("standard user attempting to set a collaborator", () => {
  //   beforeEach(done => {
  //     User.create({
  //       email: "member@standard.com",
  //       username: "standard",
  //       password: "123456",
  //       role: 0
  //     }).then(user => {
  //       request.get(
  //         {
  //           url: "http://localhost:3000/auth/fake",
  //           form: {
  //             email: this.user.email,
  //             password: this.user.password,
  //             role: this.user.role
  //           }
  //         },
  //         (err, res, body) => {
  //           done();
  //         }
  //       );
  //     });
  //   });

  // describe("POST /wikis/:wikiId/collaborators/create", () => {
  //   it("should not create a new collaborator", done => {
  //     const options = {
  //       url: `${base}${this.wiki.id}/collaborators/create`,
  //       form: {
  //         collaboratorId: this.user.id,
  //         wikiId: this.wiki.id,
  //         wikiOwner: this.user.id
  //       }
  //     };
  //     let collabCountBeforeCreate;
  //     this.wiki.getCollaboratorsFor(this.wiki.id).then(collaborators => {
  //       collabCountBeforeCreate = collaborators.length;
  //
  //       request.post(options, (err, res, body) => {
  //         Collaborator.findAll({ where: { wikiId: this.wiki.id } })
  //           .then(collaborator => {
  //             expect(collabCountBeforeCreate).toBe(collaborator.length); // confirm no collaborators created
  //             done();
  //           })
  //           .catch(err => {
  //             console.log(err);
  //             done();
  //           });
  //       });
  //     });
  //   });
  // });

  //tests for Premium User
  describe("Premium User Adding and removing collaborators", () => {
    beforeEach(done => {
      User.create({
        email: "member@premium.com",
        username: "Premium",
        password: "123456",
        role: 1
      }).then(user => {
        request.get(
          {
            // mock authentication
            url: "http://localhost:3000/auth/fake",
            form: {
              role: 1, // mock authenticate as a premium user
              email: this.premiumUser.email,
              password: this.premiumUser.password
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("POST /wikis/:id/collaborators/create", () => {
      it("should create a collaborator for the wiki", done => {
        const options = {
          url: `${base}${this.wiki.id}/collaborators/create`,
          form: {
            collaboratorId: this.standardUser.id,
            wikiId: this.wiki.id,
            wikiOwner: this.premiumUser.id
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Collaborator.findOne({
            where: {
              collaboratorId: this.standardUser.id,
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
          console.log(
            "this is the collaborator that should be removed " + collaborator.id
          );
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
                console.log(collaborator.id);
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
