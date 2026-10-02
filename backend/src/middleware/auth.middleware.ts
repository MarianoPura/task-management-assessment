import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const payload = verifyToken(token);

        res.locals.userId = payload.userId;

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
}