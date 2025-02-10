import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from './components/navbar';
import { Sidebar } from './components/sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AuthProvider from './providers/session-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IvyLeagueTr",
  description: "Turkish Ivy League Community",
  icons: {
    icon: "/favicon.ico"
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider session={session}>
          <div className="min-h-screen bg-stone-100">
            <Navbar />
            <Sidebar />
            <main className="ml-64 pt-16 flex-1 p-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
