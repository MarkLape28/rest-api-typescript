import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

// Define interfaces
export interface User {
    username: string;
    email: string;
    password: string;
}

export interface UnitUser extends User {
    id: string;
}

export interface Users {
    [key: string]: UnitUser;
}

const usersPath = "./data/users.json"; // Adjust path as needed

let users: Users = {};

// Ensure the data file exists
if (fs.existsSync(usersPath)) {
    try {
        const fileData = fs.readFileSync(usersPath, "utf-8");
        users = JSON.parse(fileData) as Users;
    } catch (error) {
        console.error("Error parsing users.json:", error);
        users = {};
    }
}

function saveUsers() {
    try {
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error("Error saving users.json:", error);
    }
}

// No need to redeclare exports later
export const findAll = async (): Promise<UnitUser[]> => {
    return Object.values(users);
};


export const updateUser = async (user_id: string, updatedData: Partial<User>): Promise<UnitUser | null> => {
    const user = users[user_id];
    if (!user) return null;

    if (updatedData.username) user.username = updatedData.username;
    if (updatedData.email) user.email = updatedData.email;
    if (updatedData.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updatedData.password, salt);
    }

    users[user_id] = user;
    saveUsers();
    
    return user;
};

export const create = async (user: User): Promise<UnitUser | null> => {
    const user_id = Date.now().toString();
    const newUser: UnitUser = { id: user_id, ...user };

    try {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(user.password, salt);
    } catch (error) {
        console.error("Error hashing password:", error);
        return null;
    }

    users[user_id] = newUser;
    saveUsers();

    return newUser;
};

export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
    return Object.values(users).find(user => user.email === user_email) || null;
};

export const validatePassword = async (user_email: string, user_password: string): Promise<boolean> => {
    const user = await findByEmail(user_email);
    if (!user) return false;

    try {
        return await bcrypt.compare(user_password, user.password);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};

export const getById = async (user_id: string): Promise<UnitUser | null> => {
    return users[user_id] || null;
};

// Implemented findOne
export const findOne = async (id: string): Promise<UnitUser | null> => {
    return users[id] || null;
};

// Implemented comparePassword
export const comparePassword = async (email: string, password: string): Promise<boolean> => {
    const user = await findByEmail(email);
    if (!user) return false;

    try {
        return await bcrypt.compare(password, user.password);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};

// Implemented update
export const update = async (id: string, body: Partial<User>): Promise<UnitUser | null> => {
    return await updateUser(id, body);
};

// Implemented remove
export const remove = async (id: string): Promise<boolean> => {
    if (!users[id]) {
        return false;
    }

    delete users[id];
    saveUsers();

    return true;
};

/* export default {
    findAll,
    updateUser,
    create,
    findByEmail,
    validatePassword,
    getById,
    findOne,
    comparePassword,
    update,
    remove
};*/

export {}; // Ensures TypeScript sees it as a module
