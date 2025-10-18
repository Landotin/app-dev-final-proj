import express from "express";
// The deductFare function is deprecated and no longer used, so it's removed from imports.
import { getAllStudents, findStudent, registerStudent, validateStudent, updateStudent } from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:identifier", findStudent);
router.post("/", registerStudent);
router.patch("/:rfid/validate", validateStudent);
router.put("/:rfid", updateStudent);
// The /fare/deduct route is removed as this logic is now handled by the exit tap.

// This line is crucial. It makes the router available to be imported in other files.
export default router;
