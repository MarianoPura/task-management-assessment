import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const statuses = [
        "To Do",
        "In Progress",
        "Completed",
    ];

    const priorities = [
        "Low",
        "Medium",
        "High",
    ];

    for (const name of statuses) {
        await prisma.taskStatus.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    for (const name of priorities) {
        await prisma.taskPriority.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    console.log("Task statuses and priorities seeded.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });