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
.get("/GetListChatRoomByAccountID", function (req, res) {
  var query  = req.query;
  var mAccountID = query.accountID;
  var listResult = {};

  let db = new sqlite3.Database(m_keycaption.path_database);
  db.serialize(() => {
    //Get current row number
    let sql = `SELECT *
            FROM chatroom
            WHERE accountIDs  LIKE %?%`;

    db.all(sql, [mAccountID], (err, rows) => {
      if (err) {
      }
      rows.forEach((row) => {
        listResult.push(row);
      });
    });
  });

  db.close();
  return listResult;
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

  socket.on('send_message', (msg) => {
    var mCurrentDate = new Date();
    var mID = mFromAccountID + "_" + mCurrentDate.YYYYMMDDHHMMSS();
    var mFromAccountID = msg["fromAccountID"];
    var mToAccountID = msg["toAccountID"];
    var mMessage = msg["message"];
    var mStatus = 0;
    var mRowNumber = -1;
    var mStartDate = mCurrentDate.YYYYMMDDHHMMSS();
    var mLastDate = mCurrentDate.YYYYMMDDHHMMSS();
    var mChatroomID = msg["chatroomID"];
    let db = new sqlite3.Database(m_keycaption.path_database);
    db.serialize(() => {
      //Get current row number
      let sql = `SELECT MAX(row_number) CurrentRowNumber
              FROM chatroom_message
              WHERE chatroomID  = ?`;

      db.get(sql, [mChatroomID], (err, row) => {
        if (err) {
          return mRowNumber = -1;
        }
        return row
          ? mRowNumber = row.CurrentRowNumber
          : mRowNumber = -1;
      });

      if (mRowNumber > 0) {
        sql = `INSERT INTO chatroom_message (id,from_accountID,accountID, message,status,row_number,startdate, lastdate, chatroomID) 
        VALUES(?,?,?,?,?,?,?,?,?)`;

        db.run(m_keycaption.q_sqlite_tb_chatroom, [mID, mFromAccountID, mToAccountID, mMessage, mStatus, mRowNumber, mStartDate, mLastDate, mChatroomID], function (err) {
          // 
        });
      }
    });

    db.close();

    msg["id"] = mID;
    io.emit(toAccountID + "_received_message", msg);
  })

  socket.on('confirm_receive_message', (msg) => {
    var mID = msg["id"];
    var mStatus = 1;
    if(mID != null && mID != undefined && mID != ""){
      var  sql = `UPDATE chatroom_message 
      SET status = '` + mStatus + ` `
     + `WHERE id = '` + mID + ``;

     db.run(sql, function (err) {
      // 
    });
    }
  })
})


http.listen(port, () => {
  var mCurrentDate = new Date();
  //checkfile database
  m_keycaption.path_database = m_keycaption.path_db_directory + "/" + m_keycaption.name_dbsqlite + "_" + mCurrentDate.YYYYMMDDHHMMSS() + ".db";
  console.log(m_keycaption.path_database);

  fs.lstat(m_keycaption.path_database, (err, stats) => {
    if (err) {
      fs.mkdir(m_keycaption.path_db_directory,
        (err) => {
          if (err) {
            return console.error(err);
          }
        });

      fs.writeFile(m_keycaption.path_database, '', function (err) {
        if (err) throw err;
      });
      initDatabase();
    }
    else {
      initDatabase();
    }
  });
});

//Database functionlity
function initDatabase() {
  //init database
  const db = new sqlite3.Database(m_keycaption.path_database, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database successfully!');
  });

  db.run(m_keycaption.q_sqlite_tb_chatroom, {}, function (err) {
    // 
  });
  db.run(m_keycaption.q_sqlite_tb_chatroom_message, {}, function (err) {
    // 
  });
  db.run(m_keycaption.q_sqlite_tb_contact, {}, function (err) {
    // 
  });
  db.run(m_keycaption.q_sqlite_tb_chatsystem, {}, function (err) {
    // 
  });
  db.close();
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


Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
  value: function () {
    function pad2(n) {  // always returns a string
      return (n < 10 ? '0' : '') + n;
    }

    return this.getFullYear() +
      pad2(this.getMonth() + 1) +
      pad2(this.getDate()) +
      pad2(this.getHours()) +
      pad2(this.getMinutes()) +
      pad2(this.getSeconds());
  }
});