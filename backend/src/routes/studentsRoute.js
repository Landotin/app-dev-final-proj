import express from "express";
import { getAllStudents, getStudentByRfid, registerStudent, validateStudent } from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:rfid", getStudentByRfid);
router.post("/", registerStudent);
router.patch("/:rfid/validate", validateStudent);



export default router;
