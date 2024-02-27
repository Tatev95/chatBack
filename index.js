const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(socket.id, "socket id, user connected");

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log("user with id joined room", socket.id, data);
  });

  fs.readFile("./db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const messages = JSON.parse(data);
    socket.emit("load_messages", messages);
  });

  socket.on("new_message", (message) => {
    fs.readFile("./db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const messages = JSON.parse(data);
      messages.push(message);

      fs.writeFile("./db.json", JSON.stringify(messages, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        io.emit("new_message", message);
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
