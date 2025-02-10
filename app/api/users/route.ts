import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/user"; // Adjust the path if needed
import connectDB from "@/lib/db"; // Ensure you have a database connection function

export async function POST(req: Request) {
    try {
        await connectDB(); // Connect to MongoDB

        const { username, email, password } = await req.json();

        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return NextResponse.json({ error: "Username or Email already exists" }, { status: 400 });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
