import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import healthRouter from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

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

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;