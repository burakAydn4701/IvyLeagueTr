'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MoreOptionsMenuProps {
    onDelete: (e: React.MouseEvent) => Promise<void>;
    isAuthor: boolean;
}

export default function MoreOptionsMenu({ onDelete, isAuthor }: MoreOptionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthor) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
            >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this?')) {
                                onDelete(e);
                            }
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 rounded-lg"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
} 