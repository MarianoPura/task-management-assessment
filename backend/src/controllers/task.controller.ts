import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
    createTaskSchema,
    updateTaskSchema,
} from "../validators/task.validator.js";

// List all tasks belonging to the authenticated user with search and filter
export async function getTasks(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const { search, status, priority } = req.query;

    try {
        // Build query filter strictly scoped to the authenticated user
        const where: any = {
            userId,
        };

        if (typeof search === "string" && search.trim() !== "") {
            where.title = {
                contains: search.trim(),
                mode: "insensitive",
            };
        }

        if (typeof status === "string" && status.trim() !== "") {
            const statusId = Number(status);
            if (!isNaN(statusId)) {
                where.statusId = statusId;
            } else {
                where.status = {
                    name: status.trim(),
                };
            }
        }

        if (typeof priority === "string" && priority.trim() !== "") {
            const priorityId = Number(priority);
            if (!isNaN(priorityId)) {
                where.priorityId = priorityId;
            } else {
                where.priority = {
                    name: priority.trim(),
                };
            }
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                status: true,
                priority: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json({
            success: true,
            data: { tasks },
        });
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
        });
    }
}

// Get metadata (statuses and priorities) to populate dropdowns
export async function getTaskMetadata(req: Request, res: Response) {
    try {
        const [statuses, priorities] = await Promise.all([
            prisma.taskStatus.findMany({
                orderBy: { id: "asc" },
            }),
            prisma.taskPriority.findMany({
                orderBy: { id: "asc" },
            }),
        ]);

        return res.json({
            success: true,
            data: {
                statuses,
                priorities,
            },
        });
    } catch (error) {
        console.error("Error retrieving task metadata:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve task metadata",
        });
    }
}

// Get single task details strictly scoped to current user
export async function getTaskById(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const taskId = Number(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID",
        });
    }

    try {
        // Enforce data ownership in database query
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
            },
            include: {
                status: true,
                priority: true,
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.json({
            success: true,
            data: { task },
        });
    } catch (error) {
        console.error("Error retrieving task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve task details",
        });
    }
}

// Create a new task for the authenticated user
export async function createTask(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const result = createTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid task data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { title, description, statusId, priorityId, dueDate } = result.data;

    try {
        // Verify status and priority exist
        const [statusExists, priorityExists] = await Promise.all([
            prisma.taskStatus.findUnique({ where: { id: statusId } }),
            prisma.taskPriority.findUnique({ where: { id: priorityId } }),
        ]);

        if (!statusExists) {
            return res.status(400).json({
                success: false,
                message: "Selected status is invalid",
            });
        }

        if (!priorityExists) {
            return res.status(400).json({
                success: false,
                message: "Selected priority is invalid",
            });
        }

        const task = await prisma.task.create({
            data: {
                userId,
                title,
                description: description || null,
                statusId,
                priorityId,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: {
                status: true,
                priority: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: { task },
        });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create task",
        });
    }
}

// Update an existing task belonging to the authenticated user
export async function updateTask(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const taskId = Number(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID",
        });
    }

    const result = updateTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid task data",
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { title, description, statusId, priorityId, dueDate } = result.data;

    try {
        // Enforce data ownership: Check that the task exists and belongs to the user
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Verify status and priority exist
        const [statusExists, priorityExists] = await Promise.all([
            prisma.taskStatus.findUnique({ where: { id: statusId } }),
            prisma.taskPriority.findUnique({ where: { id: priorityId } }),
        ]);

        if (!statusExists) {
            return res.status(400).json({
                success: false,
                message: "Selected status is invalid",
            });
        }

        if (!priorityExists) {
            return res.status(400).json({
                success: false,
                message: "Selected priority is invalid",
            });
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description: description || null,
                statusId,
                priorityId,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: {
                status: true,
                priority: true,
            },
        });

        return res.json({
            success: true,
            message: "Task updated successfully",
            data: { task: updatedTask },
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update task",
        });
    }
}

// Delete an existing task belonging to the authenticated user
export async function deleteTask(req: Request, res: Response) {
    const userId = res.locals.userId as number;
    const taskId = Number(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID",
        });
    }

    try {
        // Enforce data ownership before deletion
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        return res.json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete task",
        });
    }
}
