import { Router } from "express";
import { getNote, upsertNote, deleteNote } from "../controllers/noteController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getNote);
router.post("/", requireAuth, upsertNote);
router.delete("/:id", requireAuth, deleteNote);

export default router;