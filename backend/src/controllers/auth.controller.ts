import type { Request, Response } from "express";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../validators/auth.validator.js";
import {
    registerUser,
    loginUser,
    getUserById,
    requestPasswordReset,
    resetUserPassword,
} from "../services/auth.service.js";
import { createToken } from "../utils/auth.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid registration data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const user = await registerUser(result.data);

        const token = createToken(user.id);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMAIL_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered",
                });
            }

            if (error.message === "USERNAME_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken",
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
}

export async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid login data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const user = await loginUser(result.data);

        const token = createToken(user.id);

        res.cookie("token", token, cookieOptions);

        return res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_CREDENTIALS"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
}

export async function logout(req: Request, res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.json({
        success: true,
        message: "Logout successful",
    });
}

export async function me(req: Request, res: Response) {
    const userId = res.locals.userId as number;

    try {
        const user = await getUserById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
        });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        await requestPasswordReset(result.data.email);

        // Security requirement: Never reveal whether an email exists
        return res.json({
            success: true,
            message:
                "If an account associated with this email exists, password reset instructions have been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request",
        });
    }
}

export async function resetPassword(req: Request, res: Response) {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid password reset data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        await resetUserPassword(result.data.token, result.data.password);

        return res.json({
            success: true,
            message:
                "Password has been successfully reset. You can now log in with your new password.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_TOKEN") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password reset token",
                });
            }
            if (error.message === "TOKEN_ALREADY_USED") {
                return res.status(400).json({
                    success: false,
                    message: "This password reset token has already been used",
                });
            }
            if (error.message === "TOKEN_EXPIRED") {
                return res.status(400).json({
                    success: false,
                    message: "This password reset link has expired",
                });
            }
        }

        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
}