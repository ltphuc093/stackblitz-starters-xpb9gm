const q_sqlite_tb_chatroom =
    'CREATE TABLE chatroom (id TEXT PRIMARY KEY, accountIDs TEXT, fromAccountID TEXT, countMessage INTEGER)';
const q_sqlite_tb_contact =
    'CREATE TABLE contact (id TEXT PRIMARY KEY, accountID1 TEXT, accountID2 Text, fullname TEXT, mobile TEXT, avatar TEXT, email TEXT)';
const q_sqlite_tb_chatroom_message =
    'CREATE TABLE chatroom_message (id TEXT PRIMARY KEY,from_accountID TEXT,accountID TEXT, message TEXT,status TEXT, row_number INTEGER, startdate TEXT, lastdate TEXT, chatroomID TEXT)';
const q_sqlite_tb_chatsystem =
    'CREATE TABLE chatsystem (accountID TEXT PRIMARY KEY, countContact TEXT, countContact_Date INTEGER)';
var path_db_directory = "./db";
const name_dbsqlite = "db_local_ltpacha.db";
var path_database = path_db_directory + "/" + name_dbsqlite;


module.exports = {
    q_sqlite_tb_chatroom: q_sqlite_tb_chatroom,
    q_sqlite_tb_contact: q_sqlite_tb_contact,
    q_sqlite_tb_chatroom_message: q_sqlite_tb_chatroom_message,
    q_sqlite_tb_chatsystem: q_sqlite_tb_chatsystem,
    name_dbsqlite: q_sqlite_tb_chatsystem,
    path_db_directory : path_db_directory,
    path_database : path_database,
};