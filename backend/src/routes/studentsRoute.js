import express from "express";
import { getAllStudents, getStudentByIdentifier, registerStudent, validateStudent, updateStudent } from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:identifier", getStudentByIdentifier);
router.post("/", registerStudent);
router.patch("/:rfid/validate", validateStudent);
router.put("/:rfid", updateStudent);


export default router;
