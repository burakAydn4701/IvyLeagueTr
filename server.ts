import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId: string) => {
            socket.join(userId);
            console.log('User joined room:', userId);
        });

        socket.on('send_message', (message) => {
            io.to(message.receiver._id).emit('receive_message', message);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
    });
}); 