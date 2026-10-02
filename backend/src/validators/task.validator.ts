import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional().nullable(),
    statusId: z.coerce.number().int().positive("Status is required"),
    priorityId: z.coerce.number().int().positive("Priority is required"),
    dueDate: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Due date must be a valid date"
        ),
});

export const updateTaskSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional().nullable(),
    statusId: z.coerce.number().int().positive("Status is required"),
    priorityId: z.coerce.number().int().positive("Priority is required"),
    dueDate: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Due date must be a valid date"
        ),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
