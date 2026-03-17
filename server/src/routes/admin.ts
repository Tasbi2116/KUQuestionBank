import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
    getAllUsers,
    updateUserRole,
    deleteUser,
} from "../controllers/adminController";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;