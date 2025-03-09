import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import * as database from "../users/user.database";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";

export const userRouter = express.Router();

// Get all users
userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();
        if (!allUsers || allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users found." });
        }
        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching users." });
    }
});

// Get a single user by ID
userRouter.get("/users/:user_id", async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const user = await database.getById(user_id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        }
        return res.status(StatusCodes.OK).json(user);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching user." });
    }
});

// Create a new user
userRouter.post("/users", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }
        const userExists = await database.findByEmail(email);
        if (userExists) {
            return res.status(StatusCodes.CONFLICT).json({ error: "This email is already registered." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await database.create({ username, email, password: hashedPassword });
        return res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while creating user." });
    }
});

// Login user
userRouter.post("/users/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }
        const user = await database.findByEmail(email);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the provided email." });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect password." });
        }
        return res.status(StatusCodes.OK).json({ message: "Login successful", user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while logging in." });
    }
});

// Update user
userRouter.put("/users/:user_id", async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const { username, email, password } = req.body;
        if (!username && !email && !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide fields to update." });
        }
        const user = await database.getById(user_id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        }
        const updatedData: Partial<User> = {};
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (password) updatedData.password = await bcrypt.hash(password, 10);
        
        const updatedUser = await database.updateUser(user_id, updatedData);
        return res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while updating user." });
    }
});
