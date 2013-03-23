var mongoose = require('mongoose');
var model = require('../model');
var utils = require('../utils');
var stopwords = require('stopwords').english;
var Snowball = require('snowball');

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
  var fbdata = new model.fbdata({data:JSON.stringify(req.body)});
  fbdata.save(function(err) {
    if(err) handleError(err);
  });
  mongoose.disconnect();
  res.send('ok');
};

exports.train = function(req, res) {
  // get only the latest stored data, train on it
  mongoose.connect('localhost', 'bdb');
  var fbdata = model.fbdata;

  var categories = constants.categories;

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

exports.trainsave = function(req, res) {
  // sent through form data
  var categories = req.body.cat;
  var descriptions = req.body.desc;
  
  if(categories.length != descriptions.length) {
    res.send('ERR[trainsave]: Categories length, descriptions length are not equal o_0');
  }

  var stemmer = new Snowball('English');

  for(var i=0; i<categories.length; i++) {
    // stemming and stopwords
    var dwords = descriptions[i].split(" ");
    for(var i=0; i<dwords.length; i++) {
      stemmer.setCurrent(dwords[i]);
      stemmer.stem();
      dwords[i] = stemmer.getCurrent();
      if(dwords[i] == model.stopwords[dwords[i]]) { // word exists in stopwords
        dwords.remove(i);
      }
    }

    // get bag of words
    var genbagofwords = utils.getbagofwords(dwords);

    // update global count
    if(model.bigbagwords.count() > 0) {
    model.bigbagwords.find({type:"allw"}, function(err, res) {
      var bigbag = res[0].allwords;
      for(var word in genbagofwords) {
        if(bigbag[word] == "" || bigbag[word] == undefined) {
          bigbag[word] = 1;
        } else {
          bigbag[word]++;
        }
      }
    });
    } else {
      var bigbagwords = new model.bigbagwords({type:"allw", allwords:genbagofwords});
      bigbagwords.save(function(err) {
        console.log('ERR[bigbagwords]: Something went wrong');
      });
    }
   
    // update each category count
    model.catbagwords.find({category:categories[i]}, function(err, docs) {
      var cbw;

      if(docs.length == 0) { // if its a new category
        cbw = new model.catbagwords({category:categories[i], bagofwords:genbagofwords});
        cbw.save(function(err) {
          console.log("ERR[catbagwords] : New category didn't get saved");
        });
      } else { // update word count
        cbw = docs[0];
        for(var word in genbagofwords) {
          if(cbw.bagofwords[word] == "" || cbw.bagofwords[word] == undefined) {
            cbw.bagofwords[word] = 1;
          } else {
            cbw.bagofwords[word]++;
          }
        }
      }
    });
  }
  res.send('Word counts updated.');
}

exports.reclassify = function(req, res) {
  // classify the documents
}
