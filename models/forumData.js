var db       = require('../db');
var mongoose = require('mongoose');
 
var forumDataSchema = new mongoose.Schema({
  category: String,
  posts: [{
    user: String,
    datePosted: String,
    content: String
  }]
});
 
module.exports = db.model('ForumData', forumDataSchema, 'forum_data');