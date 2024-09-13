require("dotenv").config();

const stripe = require("stripe")(process.env.stripe_key);

const generateCheckoutSession = async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			payment_method_types: ["card"],
			line_items: [
				{
					price: process.env.priceId,
					quantity: 1,
				},
			],
			billing_address_collection: "required",
			phone_number_collection: { enabled: true },
			success_url: `${process.env.CLIENT_URL}/payment/success`,
			cancel_url: `${process.env.CLIENT_URL}/payment/error`,
		});

		console.log(session);

		// Store session.id so that it can be retrieved later for verification

		res.json({ url: session.url });
	} catch (e) {
		res.status(500).json({ success: false, message: e.message });
	}
};

const validateCheckoutSession = async (req, res) => {
	// retrieve the session.id
	const { sessionId } = req.query;
	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.payment_status === "paid") {
		// Update as needed
	} else {
		res.status(400).json({ error: "The session was not completed since user didn't make payment" });
	}
	res.status(200).json({ message: "Validation was successful" });
};

module.exports = {
	generateCheckoutSession,
	validateCheckoutSession,
};
