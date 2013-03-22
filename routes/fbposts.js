var mongoose = require('mongoose');
var model = require('../model');

exports.list = function(req, res) {
  //res.render('postsview', {title:'Posts'});
  res.render('plain', {title:'Posts'});
};

exports.store = function(req, res) {
  // push it to db
  mongoose.connect('localhost', 'bdb');
  //var schema = mongoose.Schema({date:{type:Date, default:Date.now}, data:String});
  //var FbData = mongoose.model('FbDatas', schema);

  //var fbdata = new FbData({data:JSON.stringify(req.body)});
  var fbdata = model.fbdata;
  fbdata.save(function(err) {
    if(err) handleError(err);

    // saved!
  });
  mongoose.disconnect();
  res.send('ok');
};

exports.train = function(req, res) {
  // get only the latest stored data, train on it
  mongoose.connect('localhost', 'bdb');
  var fbdata = model.fbdata;

  /*
  The categories:
   - officespace
   - events
   - jobs
   - investors
   - advice
   - ineedfeedback
   - general
  */
  var categories = ['officespace', 'events', 'jobs', 'investors', 'advice', 'ineedfeedback', 'general'];

  // query to get the latest day's worth of json
  var query = fbdata.find();
  query.sort('-date').limit(2).exec(function(err, posts) {
    var viewobjarr = [];
    for(var i=0; i<posts.length; i++) {
      var fbobjarr = JSON.parse(posts[i].data).data;
      for(var j=0; j<fbobjarr.length; j++) {
        var fbobj = fbobjarr[j];
        viewobjarr.push({
          "name" : fbobj.from.name,
          "desc" : fbobj.message,
          "categories" : categories
        });
      }
    }
    res.render('train', {data:viewobjarr});
  });

  mongoose.disconnect();
}
