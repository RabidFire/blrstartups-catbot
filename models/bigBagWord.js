var db       = require('../db');
var mongoose = require('mongoose');
 
var bigBagWordSchema = new mongoose.Schema({
  type: String,
  allWords: Object
});
 
module.exports = db.model('BigBagWord', bigBagWordSchema, 'big_bag_words');