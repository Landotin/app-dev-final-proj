import express from "express";
// MODIFIED: This should import the new resetJourney function from your controller
import { resetJourney } from "../controllers/tapsController.js";

const router = express.Router();

// MODIFIED: This is the single, correct route for the admin action of resetting a journey.
// It listens for POST requests at the URL /api/taps/reset-journey
router.post("/reset-journey", resetJourney);

export default router;

