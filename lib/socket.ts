import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export const initSocket = (server: NetServer) => {
    const io = new SocketIOServer(server, {
        path: '/api/socket',
        addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId: string) => {
            socket.join(userId);
            console.log('User joined room:', userId);
        });

        socket.on('send_message', (message) => {
            io.to(message.receiver).emit('receive_message', message);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}; 