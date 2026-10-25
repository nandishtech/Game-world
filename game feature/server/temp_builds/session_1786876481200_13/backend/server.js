/**
 * Socket.IO Multiplayer Game Synchronization Server
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../')));

// In-memory session tracking
const rooms = {};

io.on('connection', (socket) => {
  console.log('User socket connected:', socket.id);

  socket.on('joinRoom', ({ roomId, playerColor }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        players: {},
        board: null,
        turn: 'w'
      };
    }
    
    rooms[roomId].players[socket.id] = playerColor || (Object.keys(rooms[roomId].players).length === 0 ? 'w' : 'b');
    
    io.to(roomId).emit('roomUpdate', rooms[roomId]);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('makeMove', ({ roomId, from, to }) => {
    const room = rooms[roomId];
    if (room) {
      // Broadcast move to other player in room
      socket.to(roomId).emit('moveReceived', { from, to });
      room.turn = room.turn === 'w' ? 'b' : 'w';
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit('roomUpdate', rooms[roomId]);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Multiplayer Game Server running on port ${PORT}`);
});
