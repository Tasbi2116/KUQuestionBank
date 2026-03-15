import { Router } from "express";
import {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../controllers/departmentController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.post("/", requireAuth, requireAdmin, createDepartment);
router.patch("/:id", requireAuth, requireAdmin, updateDepartment);
router.delete("/:id", requireAuth, requireAdmin, deleteDepartment);

export default router;