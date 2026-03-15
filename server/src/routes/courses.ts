import { Router } from "express";
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/courseController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", requireAuth, requireAdmin, createCourse);
router.patch("/:id", requireAuth, requireAdmin, updateCourse);
router.delete("/:id", requireAuth, requireAdmin, deleteCourse);

export default router;