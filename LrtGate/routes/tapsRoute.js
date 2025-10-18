import express from "express";
import { handleEntryTap, handleExitTap } from "../controllers/tapsController.js";

const router = express.Router();

// Route for handling an entry tap
router.post("/entry", handleEntryTap);

// Route for handling an exit tap
router.post("/exit", handleExitTap);

export default router;
