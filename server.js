const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const users = {};
const messages = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('register', (username, callback) => {
        if (users[username]) {
            callback({ success: false, message: 'Username already taken' });
        } else {
            users[username] = socket.id;
            socket.username = username;
            callback({ success: true, users: Object.keys(users) });
            io.emit('update user list', Object.keys(users));
        }
    });

    socket.on('send message', (to, message) => {
        if (users[to]) {
            io.to(users[to]).emit('new message', { from: socket.username, message, time: new Date().toLocaleTimeString() });
        }
        if (!messages[to]) messages[to] = [];
        messages[to].push({ from: socket.username, message, time: new Date().toLocaleTimeString() });
    });

    socket.on('get messages', (user) => {
        if (messages[user]) {
            socket.emit('update messages', messages[user]);
        }
    });

    socket.on('send file', (file) => {
        if (users[file.name]) {
            io.to(users[file.name]).emit('new file', file);
        }
    });

    socket.on('update profile', (profileData) => {
        // Handle profile update
    });

    socket.on('typing', (username) => {
        if (users[username]) {
            io.to(users[username]).emit('typing', socket.username);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        delete users[socket.username];
        io.emit('update user list', Object.keys(users));
    });
});

server.listen(port, () => console.log(`Server running on port https://localhost:${port}`));
