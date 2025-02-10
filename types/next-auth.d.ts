import NextAuth from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        username: string;
        profilePicture?: string;
        isAdmin?: boolean;
    }

    interface Session {
        user: User & {
            id: string;
            username: string;
            profilePicture?: string;
            isAdmin?: boolean;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        username: string;
        profilePicture?: string;
        isAdmin?: boolean;
    }
}
