'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { LogOut, User as UserIcon, Settings, Mail, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface User {
    email: string;
    username: string;
    profilePicture?: string;
    isAdmin: boolean;
}

interface UserSearchResult {
    _id: string;
    username: string;
    profilePicture?: string;
}

export const Navbar = () => {
    const { data: session, status } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.users);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <nav className="sticky top-0 bg-stone-100 shadow-md z-50 h-13">
            <div className="flex items-center justify-between h-13 px-4">
                {/* Logo and Brand */}
                <div className="flex items-center -my-3">
                    <Image 
                        src="/logo.png"
                        alt="IvyLeagueTr Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                    <Link href="/" className="text-green-600 font-astloch text-3xl">
                        IvyLeagueTr
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md mx-12" ref={searchRef}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-black" />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg py-1 max-h-96 overflow-y-auto">
                            {searchResults.map((user) => (
                                <Link
                                    key={user._id}
                                    href={`/users/${user.username}`}
                                    className="flex items-center px-4 py-2 hover:bg-stone-100"
                                    onClick={() => {
                                        setShowResults(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <div className="w-8 h-8 relative rounded-full overflow-hidden mr-3">
                                        <Image
                                            src={user.profilePicture || '/default-avatar.jpg'}
                                            alt={user.username}
                                            fill
                                            sizes="32px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="text-black font-medium">
                                        {user.username}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auth Section */}
                <div className="flex items-center space-x-6">
                    {status === 'loading' ? (
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : session?.user ? (
                        <>
                            {/* Message Link */}
                            <Link
                                href="/messages"
                                className="text-gray-600 hover:text-green-600 transition"
                                title="Messages"
                            >
                                <Mail className="w-7 h-7" />
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="focus:outline-none"
                                >
                                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
                                        <Image
                                            src={session.user.profilePicture || '/default-avatar.jpg'}
                                            alt="Profile"
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                                        <Link
                                            href={`/users/${session.user.username}`}
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-x-4">
                            <Link 
                                href="/login" 
                                className="text-gray-700 hover:text-green-600"
                            >
                                Login
                            </Link>
                            <Link 
                                href="/signup" 
                                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;