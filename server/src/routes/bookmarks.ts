import { Router } from "express";
import {
    getBookmarks,
    addBookmark,
    removeBookmark,
} from "../controllers/bookmarkController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getBookmarks);
router.post("/", requireAuth, addBookmark);
router.delete("/:id", requireAuth, removeBookmark);

export default router;