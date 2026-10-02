import { Router } from "express";
import {
    getTasks,
    getTaskMetadata,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all task endpoints
router.use(requireAuth);

router.get("/", getTasks);
router.get("/meta", getTaskMetadata);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
