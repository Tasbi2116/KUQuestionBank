import { Router } from "express";
import { requireAuth, requireDisciplineAdmin } from "../middleware/auth";
import {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getStats,
} from "../controllers/adminController"

const router = Router();

router.use(requireAuth, requireDisciplineAdmin);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;