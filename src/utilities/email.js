const sgMail = require("@sendgrid/mail");
module.exports = function(username, email) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: `${email}`,
    from: { email: "lauren4c@gmail.com", name: "Blocipedia" },
    subject: "Welcome to Blocipedia",
    text: `Hi there, ${username}! Thanks for signing up for Blocipedia. Your account is ready for you.`,
    html: `<a href:"https://blocipedia-4c.herokuapp.com/">Blocipedia</a>`
  };
  sgMail.send(msg);
};
