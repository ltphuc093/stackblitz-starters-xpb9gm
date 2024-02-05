const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const sqlite3 = require('sqlite3').verbose();
const m_common = require("./common.js");
const port = process.env.PORT || 8000
const fs = require("fs")


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html")
})

io.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('disconnect', () => {
    console.log('Client disconnected')
  });

  socket.on('message', (msg) => {
    io.emit('message', msg)
  })

  socket.on('messageFL', (msg) => {
    var chatroomID = msg["chatroomID"];
    // io.emit('message', msg);
    io.emit('ChatRoom_ID'+chatroomID, msg);
  })
})


http.listen(port, () => {
  //checkfile database
  fs.lstat(m_common.path_database, (err, stats) => {
    if (err) {
      console.error(err);
      fs.mkdir(m_common.path_db_directory,
        (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });

        fs.writeFile(m_common.path_database, '', function (err) {
          if (err) throw err;
          console.log('File is created successfully.');
        });
      initDatabase();
    }
    else {
      initDatabase();
    }
  });

  function initDatabase(){
    //init database
    const db=new sqlite3.Database(m_common.path_database, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {

        console.error(err.message);
      }
      console.log('Connected to the chinook database.');
    });
    console.log(`App listening on port ${port}`)
  }
});