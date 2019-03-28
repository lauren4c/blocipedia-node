var stripe = require("stripe")(process.env.STRIPE_API);

// Token is created using Checkout or Elements!
// Get the payment token ID submitted by the form:
//const token = request.body.stripeToken; // Using Express

module.exports = function(email, token, callback) {
  try {
    (async () => {
      const charge = await stripe.charges
        .create({
          amount: 1500,
          currency: "usd",
          description: "User Upgrade",
          source: token,
          receipt_email: email
        })
        .then(charge => {
          callback(null, charge);
        })
        .catch(err => {
          callback(err);
        });
    })();
  } catch (e) {
    console.log("This is the event " + e);
  }
};
