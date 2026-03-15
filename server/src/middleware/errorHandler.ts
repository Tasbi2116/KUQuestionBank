import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

/**
 * Global error handler middleware.
 * Must be registered last in Express app.
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("[ErrorHandler]", err.stack);

    const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    };

    res.status(500).json(response);
};