import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { sendPasswordResetEmail } from "../utils/email.js";

export async function registerUser(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: data.email },
                { username: data.username },
            ],
        },
    });

    if (existingUser) {
        if (existingUser.email === data.email) {
            throw new Error("EMAIL_EXISTS");
        }

        throw new Error("USERNAME_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            email: data.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
}

export async function loginUser(data: LoginInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(
        data.password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    return user;
}

export async function getUserById(userId: number) {
    return prisma.user.findUnique({
        where: {
            id: userId,
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
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // If user does not exist, silently return to prevent email enumeration
    if (!user) {
        return;
    }

    // Invalidate any previously active tokens for this user
    await prisma.passwordResetToken.updateMany({
        where: {
            userId: user.id,
            usedAt: null,
        },
        data: {
            usedAt: new Date(),
        },
    });

    // Generate random 64-character hex token
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token,
            expiresAt,
        },
    });

    await sendPasswordResetEmail(user.email, token);
}

export async function resetUserPassword(token: string, newPassword: string) {
    const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetRecord) {
        throw new Error("INVALID_TOKEN");
    }

    if (resetRecord.usedAt !== null) {
        throw new Error("TOKEN_ALREADY_USED");
    }

    if (resetRecord.expiresAt < new Date()) {
        throw new Error("TOKEN_EXPIRED");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
    });
}