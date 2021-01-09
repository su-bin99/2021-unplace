const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;

app.get('/', (req, res) => {
  res.render('chat.ejs');
});

io.on('connection', (socket) => {
  console.log("user connected");

  socket.on('userName', (userName) => {
    socket.userName = userName;
    io.emit('chatNotification', `<i>${socket.userName}님이 채팅방을 접속하셨습니다.</i>`)
  });

  socket.on('disconnect', () => {
    console.log("user disconnected");
    io.emit('chatNotification', `<i>${socket.userName}님이 채팅방을 나가셨습니다.</i>`)
  })

  socket.on('chatMessage', (chatMessage) => {
    io.emit('chatMessage', `<strong>${socket.userName}</strong>: ${chatMessage}`)
  })
});

http.listen(port, () => {
  console.log(`http://localhost:${port}`);
});