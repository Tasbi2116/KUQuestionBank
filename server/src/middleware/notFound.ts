import { Request, Response } from "express";
import { ApiResponse } from "../types";

/**
 * 404 handler — catches all unmatched routes.
 */
export const notFound = (_req: Request, res: Response): void => {
    const response: ApiResponse = {
        success: false,
        message: "Route not found",
    };
    res.status(404).json(response);
};