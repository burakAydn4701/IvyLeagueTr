import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import User from "@/lib/models/user"; // Adjust if needed
import connectDB from "@/lib/db"; // Uses db.ts for MongoDB connection

const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "example@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: { email: string; password: string }) {
                await connectDB(); // Ensure database is connected

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                // Find user by email
                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error("Invalid email or password");
                }

                // Verify password
                const isValidPassword = bcrypt.compareSync(credentials.password, user.password);
                if (!isValidPassword) {
                    throw new Error("Invalid email or password");
                }

                return { id: user._id.toString(), username: user.username, email: user.email };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.username = token.username;
            return session;
        },
    },
    pages: {
        signIn: "/login", // Redirect to custom login page if needed
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
