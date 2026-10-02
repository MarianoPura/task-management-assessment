import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production";

export function createToken(userId: number): string {
    return jwt.sign(
        {
            userId,
        },
        JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}

export function verifyToken(token: string): { userId: number } {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as {
        userId: number;
    };
    return payload;
}