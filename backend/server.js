require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io'); // For Socket.IO

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const usersRoutes = require('./routes/users.routes'); // Add users routes
const connectionRoutes = require('./routes/connection.routes');
const searchRoutes = require('./routes/search.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow frontend to connect
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected! 🚀'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Store Socket.IO instance in app context for controllers to access
app.set('socketio', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes); // Add users routes
app.use('/api/profiles', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO for real-time notifications and chat
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room for notifications (e.g., user's own ID or shared rooms)
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
    });

    // Handle chat messages (more sophisticated chat logic will be in Chat.js)
    socket.on('sendMessage', (messageData) => {
        // messageData should contain senderId, receiverId, content, chatRoomId
        console.log('Message received:', messageData);
        io.to(messageData.chatRoomId).emit('receiveMessage', messageData);
    });

    // Handle connection request notifications
    socket.on('sendConnectionRequestNotification', ({ receiverId, senderName }) => {
        io.to(receiverId).emit('newConnectionRequest', { senderName });
    });

    socket.on('connectionAcceptedNotification', ({ senderId, receiverName }) => {
        io.to(senderId).emit('connectionAccepted', { receiverName });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🎉`));