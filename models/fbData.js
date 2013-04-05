var db       = require('../db');
var mongoose = require('mongoose');
 
var fbDataSchema = new mongoose.Schema({
  date: { type:Date, default: Date.now },
  data: String
});
 
module.exports = db.model('FbData', fbDataSchema, 'fb_data');