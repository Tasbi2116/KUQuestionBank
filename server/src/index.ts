import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import departmentRouter from "./routes/departments";
import courseRouter from "./routes/courses";
import uploadRouter from "./routes/uploads";
import noteRouter from "./routes/notes";
import bookmarkRouter from "./routes/bookmarks";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import searchRouter from "./routes/search";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ?? 5000;

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(
    cors({
        origin: process.env.CLIENT_URL ?? "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, slow down." },
});
app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/courses", courseRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/notes", noteRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/search", searchRouter);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV ?? "development"}`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
});

export default app;