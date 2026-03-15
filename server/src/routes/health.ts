import { Router, Request, Response } from "express";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * GET /api/health
 * Health check endpoint — used by CRON keep-alive (Phase 8).
 */
router.get("/", (_req: Request, res: Response): void => {
    sendSuccess(
        res,
        { status: "ok", timestamp: new Date().toISOString() },
        "Server is running"
    );
});

export default router;