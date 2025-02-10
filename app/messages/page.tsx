'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
}

interface Message {
    _id: string;
    sender: User;
    receiver: User;
    content: string;
    createdAt: string;
    read: boolean;
}

export default function Messages() {
    const [conversations, setConversations] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const searchParams = useSearchParams();

    // Fetch current user and their conversations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, conversationsResponse] = await Promise.all([
                    fetch('/api/auth/check'),
                    fetch('/api/messages/conversations')
                ]);
                
                if (userResponse.ok) {
                    const { user } = await userResponse.json();
                    console.log('Current user:', user);
                    setCurrentUser(user);
                }
                
                if (conversationsResponse.ok) {
                    const data = await conversationsResponse.json();
                    console.log('Fetched conversations:', data);
                    setConversations(data.conversations);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Fetch messages when URL params change
    useEffect(() => {
        if (!searchParams) return;

        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        
        console.log('URL Params:', { userId, username });
        
        if (userId && username) {
            setSelectedUser({
                _id: userId,
                username: username,
                profilePicture: '/default-avatar.jpg'
            });
            
            // Fetch messages for this user
            const fetchMessages = async () => {
                try {
                    console.log('Fetching messages for user:', userId);
                    const response = await fetch(`/api/messages/${userId}`);
                    console.log('Messages response:', response.status);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Received messages:', data);
                        setMessages(data.messages || []); // Add fallback empty array
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            
            fetchMessages();
        }
    }, [searchParams]);

    // Add fetchConversations function
    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/messages/conversations');
            if (response.ok) {
                const data = await response.json();
                console.log('Refreshed conversations:', data);
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            const socket = io({
                path: '/api/socket',
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
                socket.emit('join', currentUser._id);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('receive_message', (message) => {
                if (selectedUser?._id === message.sender._id) {
                    setMessages(prev => [...prev, message]);
                }
                fetchConversations();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [currentUser, selectedUser]);

    // Update sendMessage function to refresh conversations
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !newMessage.trim()) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUser._id,
                    content: newMessage
                })
            });

            if (response.ok) {
                const message = await response.json();
                setMessages(prev => [...prev, message]);
                setNewMessage('');
                
                // Emit message through socket
                socketRef.current?.emit('send_message', message);
                
                // Refresh conversations list
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Add this function
    const fetchMessagesForUser = async (userId: string) => {
        try {
            console.log('Starting to fetch messages for user:', userId);
            const response = await fetch(`/api/messages/${userId}`);
            const data = await response.json();
            console.log('Raw API response:', data);
            
            if (response.ok) {
                if (Array.isArray(data.messages)) {
                    console.log('Setting messages:', data.messages);
                    setMessages(data.messages);
                } else {
                    console.warn('Messages is not an array:', data.messages);
                    setMessages([]);
                }
            } else {
                console.error('API error:', data);
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex h-[calc(100vh-200px)] bg-stone-100 rounded-lg shadow-lg">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-stone-200">
                    <div className="p-4 border-b border-stone-200">
                        <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                    </div>
                    <div className="overflow-y-auto h-full">
                        {conversations.map(user => (
                            <div
                                key={user._id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    fetchMessagesForUser(user._id);
                                }}
                                className={`flex items-center p-4 hover:bg-stone-200 cursor-pointer ${
                                    selectedUser?._id === user._id ? 'bg-stone-200' : ''
                                }`}
                            >
                                <div className="w-10 h-10 relative rounded-full overflow-hidden">
                                    <Image
                                        src={user.profilePicture || '/default-avatar.jpg'}
                                        alt={user.username}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-black font-medium">{user.username}</span>
                                        {user.lastMessage && (
                                            <span className="text-sm text-gray-600">
                                                {new Date(user.lastMessage.createdAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    {user.lastMessage && (
                                        <p className="text-sm text-gray-600 truncate">
                                            {user.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-stone-50">
                    {selectedUser ? (
                        <>
                            <div className="p-4 border-b border-stone-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedUser.username}
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {console.log('Rendering messages:', messages)}
                                {messages.length > 0 ? (
                                    messages.map(message => (
                                        <div
                                            key={message._id}
                                            className={`flex ${
                                                message.sender._id === currentUser?._id
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${
                                                    message.sender._id === currentUser?._id
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-stone-200 text-gray-800'
                                                }`}
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No messages yet</div>
                                )}
                            </div>
                            <form onSubmit={sendMessage} className="p-4 border-t border-stone-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Type a message..."
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a conversation to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 