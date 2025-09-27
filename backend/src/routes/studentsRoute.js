import express from "express";
import { getAllStudents, findStudent, registerStudent, validateStudent, updateStudent, deductFare} from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:identifier", findStudent);
router.post("/", registerStudent);
router.patch("/:rfid/validate", validateStudent);
router.put("/:rfid", updateStudent);
router.post("/fare/deduct", deductFare);


export default router;
