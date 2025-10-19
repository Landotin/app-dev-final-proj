import express from "express";
import { 
    getAllStudents, 
    findStudent, 
    registerStudent, 
    validateStudent, 
    updateStudent,
    addBalance
} from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:identifier", findStudent);
router.post("/", registerStudent);
router.patch("/:rfid/validate", validateStudent);
router.put("/:rf-id", updateStudent);

// This is the route for adding balance
router.post("/:rfid/add-balance", addBalance);

export default router;

