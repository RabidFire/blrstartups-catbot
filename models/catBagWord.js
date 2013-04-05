var db       = require('../db');
var mongoose = require('mongoose');
 
var catBagWordSchema = new mongoose.Schema({
  category: String,
  bagOfWords: Object,
  count: Number
});
 
module.exports = db.model('CatBagWord', catBagWordSchema, 'cat_bag_words');