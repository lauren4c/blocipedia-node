const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {
  beforeEach(done => {
    this.wiki;
    this.user;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "SteveTheCat",
        email: "steve@meow.com",
        password: "IAmACat"
      }).then(user => {
        this.user = user;

        Wiki.create({
          title: "Winter Sucks",
          body: "I want to go outside",
          userId: this.user.id
        }).then(wiki => {
          this.wiki = wiki;
          done();
        });
      });
    });
  });
  describe("CRUD actions for Wiki", () => {
    describe("GET /wikis", () => {
      it("should return a status code 200 and all wikis", done => {
        //#3
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Wikis");
          done();
        });
      });
    });
    describe("GET /wikis/new", () => {
      it("should render a new wiki form", done => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/create", () => {
      beforeEach(done => {
        User.create({
          email: "member@example.com",
          password: "123456",
          username: "Steve"
        }).then(user => {
          request.get(
            {
              // mock authentication
              url: "http://localhost:3000/auth/fake",
              form: {
                username: this.user.username, // mock authenticate as a user
                userId: this.user.id,
                email: this.user.email
              }
            },
            (err, res, body) => {
              done();
            }
          );
        });
      });
      it("should create a new wiki and redirect", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "Watching snow melt",
            body:
              "Without a doubt my favoriting things to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "Watching snow melt" } })
            .then(wiki => {
              expect(wiki).not.toBeNull();
              expect(wiki.title).toBe("Watching snow melt");
              expect(wiki.body).toBe(
                "Without a doubt my favoriting things to do besides watching paint dry!"
              );
              expect(wiki.userId).not.toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
    describe("GET wikis/:id", () => {
      it("should render a view with the selected wiki", done => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("I want to go outside");
          done();
        });
      });
    });
    describe("POST wikis/:id/destroy", () => {
      it("should delete the wiki with the associated ID", done => {
        expect(this.wiki.id).toBe(1);
        request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.findById(1).then(wiki => {
            expect(err).toBeNull();
            expect(wiki).toBeNull();
            done();
          });
        });
      });
    });

    describe("GET wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", done => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("I want to go outside");
          done();
        });
      });
    });
    describe("POST wikis/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "What is a Snowman?",
              body: "Is it when a human is outside in the snow?"
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });

      it("should update the wiki with the given values", done => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "What is a Snowman?",
            body: this.wiki.body
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Wiki.findOne({
            where: { id: this.wiki.id }
          }).then(wiki => {
            expect(wiki.title).toBe("What is a Snowman?");
            done();
          });
        });
      });
    });
  });
});