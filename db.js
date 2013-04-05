var mongoose = require('mongoose');
 
var database = 'bdb',
    hostname = 'localhost',
    username = '',
    password = '';
    port     = 27017
 
// MongoDB URI mongodb://<user>:<pass>@host/database
var uri = 'mongodb://';
if (username) {
  uri += username;
  if (password) uri += ':' + password;
  uri += '@';
}
uri += hostname + ':' + port + '/' + database;
 
var db = mongoose.createConnection(uri);
 
db.on('error', console.error.bind(console, 'MongoDB Connection Error: '));
 
module.exports = db;