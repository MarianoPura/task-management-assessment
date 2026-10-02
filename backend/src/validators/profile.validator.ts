import { z } from "zod";

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
