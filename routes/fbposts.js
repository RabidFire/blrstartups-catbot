var mongoose = require('mongoose');

exports.list = function(req, res) {
  //res.render('postsview', {title:'Posts'});
  res.render('plain', {title:'Posts'});
};

exports.store = function(req, res) {
  // push it to db
  mongoose.connect('localhost', 'bdb');
  var schema = mongoose.Schema({date:{type:Date, default:Date.now}, data:String});
  var FbData = mongoose.model('FbData', schema);

  var fbdata = new FbData({data:JSON.stringify(req.body)});
  fbdata.save(function(err) {
    if(err) handleError(err);

    // saved!
  });
  mongoose.disconnect();
  res.send('ok');
};

exports.train = function(req, res) {
  // get only the latest stored data, train on it
}
