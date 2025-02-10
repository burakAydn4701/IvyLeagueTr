import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDb from './db';
import User from './models/user';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    await connectDb();

                    const user = await User.findOne({ email: credentials.email });
                    if (!user) return null;

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) return null;

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        profilePicture: user.profilePicture || '/default-avatar.jpg',
                        isAdmin: user.isAdmin
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.profilePicture = user.profilePicture;
                token.isAdmin = user.isAdmin;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.username = token.username as string;
                session.user.profilePicture = token.profilePicture as string;
                session.user.isAdmin = token.isAdmin as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET
}; 