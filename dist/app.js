"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const database = __importStar(require("./users/user.database"));
exports.userRouter = express_1.default.Router();
/**
 * @route GET /users
 * @desc Get all users
 */
exports.userRouter.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield database.findAll();
        if (!allUsers || allUsers.length === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "No users available." });
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json({ totalUsers: allUsers.length, users: allUsers });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
/**
 * @route GET /user/:id
 * @desc Get a single user by ID
 */
exports.userRouter.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield database.findOne(req.params.id);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User not found!" });
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json(user);
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
/**
 * @route POST /signup
 * @desc Register a new user
 */
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "All fields are required." });
        }
        const existingUser = yield database.findByEmail(email);
        if (existingUser) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "Email is already registered." });
        }
        const newUser = yield database.create({ username, email, password });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json(newUser);
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
/**
 * @route POST /signin
 * @desc User login
 */
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "All fields are required." });
        }
        const user = yield database.findByEmail(email);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "No user exists with this email." });
        }
        const isPasswordCorrect = yield database.comparePassword(email, password);
        if (!isPasswordCorrect) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: "Incorrect password!" });
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Login successful", user });
    }
    catch (error) {
        console.error("Signin error:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
/**
 * @route PATCH /update/:id
 * @desc Update user details
 */
exports.userRouter.patch("/update/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username && !email && !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "Provide at least one field to update." });
        }
        const existingUser = yield database.findOne(req.params.id);
        if (!existingUser) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }
        const updatedUser = yield database.update(req.params.id, req.body);
        return res.status(http_status_codes_1.StatusCodes.OK).json(updatedUser);
    }
    catch (error) {
        console.error("Update error:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
/**
 * @route DELETE /delete/:id
 * @desc Delete a user
 */
exports.userRouter.delete("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield database.findOne(id);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User does not exist!" });
        }
        yield database.remove(id);
        return res.status(http_status_codes_1.StatusCodes.OK).json({ message: "User deleted successfully!" });
    }
    catch (error) {
        console.error("Delete error:", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
}));
