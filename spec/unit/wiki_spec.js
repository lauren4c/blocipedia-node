const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("Wiki", () => {
  beforeEach(done => {
    this.wiki;
    this.user;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "SteveTheCat",
        email: "testuser@test.com",
        password: "IAmACat"
      }).then(user => {
        this.user = user; //store the user

        Wiki.create({
          title: "What's for Dinner tonight?",
          body: "The humans will probably give me dry food again.",
          userId: this.user.id,
          private: false
        }).then(wiki => {
          this.wiki = wiki;
          done();
        });
      });
    });
  });
  describe("#create()", () => {
    it("should create a public wiki object with a title, body, and user", done => {
      //#1
      Wiki.create({
        title: "Is the water running?",
        body: "Good, because I am thirsty.",
        userId: this.user.id,
        private: false
      })
        .then(wiki => {
          //#2
          expect(wiki.title).toBe("Is the water running?");
          expect(wiki.body).toBe("Good, because I am thirsty.");
          expect(wiki.userId).toBe(this.user.id);
          expect(wiki.private).toBe(false);

          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
    it("should not create a wiki with missing title, body, or without a user", done => {
      Wiki.create({
        title: "I like to take naps"
      })
        .then(wiki => {
          // the code in this block will not be evaluated since the validation error
          // will skip it. Instead, we'll catch the error in the catch block below
          // and set the expectations there

          done();
        })
        .catch(err => {
          expect(err.message).toContain("Wiki.body cannot be null");
          expect(err.message).toContain("Wiki.userId cannot be null");
          done();
        });
    });
    it("can create a private wiki ", done => {
      // #1
      Wiki.create({
        title: "The dogs must go",
        body: "Step 1: set traps for dogs.",
        userId: this.user.id,
        private: true
      }).then(wiki => {
        expect(wiki.private).toBe(true);
        done();
      });
    });
  });
});
