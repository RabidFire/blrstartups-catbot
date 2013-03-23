var mongoose = require('mongoose');
var stopwords = require('stopwords');

module.exports.init = function() {
  console.log('** Model init');
  mongoose.connect('localhost', 'bdb');

  var  schema = new mongoose.Schema({date:{type:Date, default:Date.now}, data:String});
  var fbdata = mongoose.model('fbdata', schema);
  exports.fbdata = fbdata;

  schema = new mongoose.Schema({category:String, bagofwords:Object});
  var catbagwords = mongoose.model('catbagwords', schema);
  exports.catbagwords = catbagwords;

  schema = new mongoose.Schema({type:String, allwords:Object});
  var bigbagwords = mongoose.model('bigbagwords', schema);
  exports.bigbagwords = bigbagwords;

  // process stopwords
  var stopwords2 = {}
  for(var i=0; i<stopwords.length; i++) {
    stopwords2.stopwords[i] = stopwords[i];
  }
  exports.stopwords = stopwords2;

  mongoose.disconnect();
}
