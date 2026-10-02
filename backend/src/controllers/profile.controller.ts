import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { updateProfileSchema } from "../validators/profile.validator.js";

export async function getProfile(req: Request, res: Response) {
    const userId = res.locals.userId as number;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error("Error retrieving profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve profile",
        });
    }
}

export async function updateProfile(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid profile data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { firstName, lastName, username, email } = result.data;

    try {
        // Check if another user already uses this email
        const existingEmail = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id: userId },
            },
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email is already taken by another account",
            });
        }

        // Check if another user already uses this username
        const existingUsername = await prisma.user.findFirst({
            where: {
                username,
                NOT: { id: userId },
            },
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username is already taken by another account",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                username,
                email,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: { user: updatedUser },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
}
