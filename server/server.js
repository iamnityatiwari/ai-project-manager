const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Database Connection
connectDB();

// Make io accessible to routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('AI Project Manager API is running...');
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
