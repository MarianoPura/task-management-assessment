import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getDashboardStats(req: Request, res: Response) {
    const userId = res.locals.userId as number;

    try {
        const now = new Date();

        const [
            totalTasks,
            todoTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
        ] = await Promise.all([
            // Total tasks belonging to current user
            prisma.task.count({
                where: { userId },
            }),
            // Tasks with "To Do" status
            prisma.task.count({
                where: {
                    userId,
                    status: { name: "To Do" },
                },
            }),
            // Tasks with "In Progress" status
            prisma.task.count({
                where: {
                    userId,
                    status: { name: "In Progress" },
                },
            }),
            // Tasks with "Completed" status
            prisma.task.count({
                where: {
                    userId,
                    status: { name: "Completed" },
                },
            }),
            // Overdue tasks: due date is in the past and not completed
            prisma.task.count({
                where: {
                    userId,
                    dueDate: { lt: now },
                    status: { name: { not: "Completed" } },
                },
            }),
        ]);

        return res.json({
            success: true,
            data: {
                totalTasks,
                todoTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
        });
    }
}
