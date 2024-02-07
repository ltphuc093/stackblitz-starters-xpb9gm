const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 8000
const fs = require("fs")
const m_keycaption = require("./constant/keycaption.js");


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
    io.emit('ChatRoom_ID' + chatroomID, msg);
  })
})


http.listen(port, () => {
  //checkfile database
  fs.lstat(m_keycaption.path_database, (err, stats) => {
    if (err) {
      console.error(err);
      fs.mkdir(m_keycaption.path_db_directory,
        (err) => {
          if (err) {
            return console.error(err);
          }
          console.log('Directory created successfully!');
        });

      fs.writeFile(m_keycaption.path_database, '', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
      initDatabase();
    }
    else {
      initDatabase();
    }
  });

  //Database functionlity
  function initDatabase() {
    //init database
    const db = new sqlite3.Database(m_keycaption.path_database, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the chinook database.');
    });

    db.run(m_keycaption.q_sqlite_tb_chatroom, {}, function(err){
      // 
    });
    db.run(m_keycaption.q_sqlite_tb_chatroom_message, {}, function(err){
      // 
    });
    db.run(m_keycaption.q_sqlite_tb_contact, {}, function(err){
      // 
    });
    db.run(m_keycaption.q_sqlite_tb_chatsystem, {}, function(err){
      // 
    });

    db.close();

    console.log(`App listening on port ${port}`)
  }



  function GetListMessageByListParam_IDAndRowNumber(listQuery) {
    let db = new sqlite3.Database(m_keycaption.path_database);
    var listResult = {};
    if (listQuery.length > 0) {

      listQuery.forEach(element => {
        var m_ChatRoomID = element.chatroomID;
        var m_countMessage = element.countMessage;
        let sql = `SELECT *
                  FROM chatroom
                  WHERE id = ?
                  and countMessage >=  ?`;

        db.all(sql, [m_ChatRoomID, m_countMessage], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            listResult.push(row);
            console.log(row.name);
          });
        });
      });
    };
    db.close();

    return listResult;
  }
});