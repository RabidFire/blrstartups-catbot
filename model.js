var mongoose = require('mongoose');
var utils = require('./utils');

module.exports.init = function() {
  console.log('** Model init');
  mongoose.connect('localhost', 'bdb');

  var  schema = new mongoose.Schema({date:{type:Date, default:Date.now}, data:String});
  var fbdata = mongoose.model('fbdata', schema);
  exports.fbdata = fbdata;

  schema = new mongoose.Schema({category:String},
    {posts:[{user:String, datePosted:String, content:String}]});
  var forumdata = mongoose.model('forumdata', schema);
  exports.forumdata = forumdata;

  schema = new mongoose.Schema({category:String, bagofwords:Object, count:Number});
  var catbagwords = mongoose.model('catbagwords', schema);
  utils.categories.forEach(function(cat) {
    catbagwords.findOneAndUpdate(
        {"category":cat},
        {"category":cat, "bagofwords":{'default':'default'},count:0},
        {upsert:true}
    );
  });
  exports.catbagwords = catbagwords;

  schema = new mongoose.Schema({type:String, allwords:Object});
  var bigbagwords = mongoose.model('bigbagwords', schema);
  exports.bigbagwords = bigbagwords;


  mongoose.disconnect();
}
