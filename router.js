const express = require("express");
const attendeeController = require("./controllers/attendeeController.js");
const eventController = require("./controllers/eventController.js");
const gamesController = require("./controllers/gamesController.js");
const devController = require("./controllers/devcontroller.js");
const { generateCheckoutSession, validateCheckoutSession } = require("./controllers/stripeController.js");

const router = express.Router();

// attendee endpoints
router.get("/api/attendee/search", attendeeController.serchAttendee);
router.post("/api/attendee/register", attendeeController.register);
router.post("/api/attendee/addNote", attendeeController.addNote);

// event endpoints
router.get("/api/event/list", eventController.getEventList);
router.get("/api/event/entryList", eventController.getEntryList);
router.post("/api/event/create", eventController.createEvent);
router.post("/api/event/join", eventController.joinEvent);
router.delete("/api/event/cancel", eventController.cancelEvent);
router.delete("/api/event/drop", eventController.dropFromEvent);

// game library endpoints
router.get("/api/gamelib/title/list", gamesController.getTitleList);
router.get("/api/gamelib/copy/list", gamesController.getCopyList);
router.get("/api/gamelib/title/checkouts", gamesController.getCheckoutsByTitle);
router.post("/api/gamelib/title/create", gamesController.addTitle);
router.post("/api/gamelib/copy/create", gamesController.addCopy);
router.post("/api/gamelib/copy/checkout", gamesController.checkoutCopy);
router.patch("/api/gamelib/title/edit", gamesController.editTitle);
router.patch("/api/gamelib/copy/return", gamesController.returnCopy);
router.patch("/api/gamelib/copy/addNote", gamesController.addNote);
router.delete("/api/gamelib/title/remove", gamesController.removeTitle);
router.delete("/api/gamelib/copy/remove", gamesController.removeCopy);

// dev endpoints
// router.patch('/dev/editTable')

// stripe endpoints
router.get("/api/stripe/create-checkout-session", generateCheckoutSession);
router.get("/api/stripe/validate-checkout-session", validateCheckoutSession);

module.exports = router;
