const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
//const io = socket(server);

const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log('connection', socket.id);
  socket.on('join room', (roomID) => {
    console.log('join room', roomID);
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit('other user', otherUser);
      socket.to(otherUser).emit('user joined', socket.id);
      console.log('other user', otherUser);
    }
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
    console.log('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
    console.log('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    console.log('ice-candidate', incoming);
  });
});

server.listen(3000, () => console.log('server is running on port 3000'));
