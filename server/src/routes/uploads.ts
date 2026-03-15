import { Router } from "express";
import {
    getUploads,
    getUploadById,
    uploadFile,
    deleteUpload,
} from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";
import { upload } from "../config/multer";

const router = Router();

router.get("/", requireAuth, getUploads);
router.get("/:id", requireAuth, getUploadById);
router.post("/", requireAuth, upload.single("file"), uploadFile);
router.delete("/:id", requireAuth, deleteUpload);

export default router;