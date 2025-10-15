import express from "express";
import { resolveMismatch } from "../controllers/tapsController.js";

const router = express.Router();

// This route is specifically for the admin action of resolving a mismatch.
// It listens for POST requests at the URL /api/taps/resolve-mismatch
router.post("/resolve-mismatch", resolveMismatch);

export default router;

