import express, { Request, Response } from "express";
import { UnitUser } from "./users/user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./users/user.database";

export const userRouter = express.Router();

/**
 * @route GET /users
 * @desc Get all users
 */
userRouter.get("/users", async (_req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();
        if (allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No users available." });
        }
        return res.status(StatusCodes.OK).json({ totalUsers: allUsers.length, users: allUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
});

/**
 * @route DELETE /delete/:id
 * @desc Delete a user
 */
userRouter.delete("/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await database.findOne(id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User does not exist!" });
        }

        const isDeleted = await database.remove(id);
        if (typeof isDeleted !== "boolean" || !isDeleted) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete user." });
        }

        return res.status(StatusCodes.OK).json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
});