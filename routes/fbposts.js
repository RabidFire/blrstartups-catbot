var utils = require('../utils');
var Snowball = require('snowball');

var FbData = require('../models/fbData');
var BigBagWord = require('../models/bigBagWord');

exports.list = function(req, res) {
  res.render('plain', { title: 'Posts' });
};

exports.store = function(req, res, next) {
  var fbData = new FbData({ data: JSON.stringify(req.body) });
  fbData.save(function(err){
    if (err) return next(err);
    res.send(200);
  });
};

/*
 * renders recent fb data on screen 
 */
exports.train = function(req, res) {
  // get only the latest stored data, train on it
  var categories = utils.categories;

  // query to get the latest day's worth of json
  FbData.find().sort('-date').limit(1).exec(function(err, posts){
    var viewObjArr = [];
    for (var i = 0; i < posts.length; i++) {
      var fbObjArr = JSON.parse(posts[i].data).data;
      for(var j = 0; j < fbObjArr.length; j++) {
        var fbObj = fbObjArr[j];
        viewObjArr.push({
          "name"       : fbObj.from.name,
          "desc"       : fbObj.message,
          "categories" : categories
        });
      }
    }
    res.render('train', { data: viewObjArr });
  });
}

/*
 * User has manually categorized posts. Save it.
 */
exports.trainsave = function(req, res) {
  // sent through form data
  var categories = req.body.cat;
  var descriptions = req.body.desc;
  
  if (categories.length != descriptions.length) {
    return res.send('ERR[trainsave]: Categories length, descriptions length are not equal o_0');
  }

  var stemmer = new Snowball('English');

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    // stemming and stopwords
    var dwords = utils.stemwords(stemmer, descriptions[i]);

    // get bag of words
    var genbagofwords = utils.getbagofwords(dwords);

    // Pradeep: count() is asynchronous. Not sure if this should be in the loop.
    BigBagWord.count(function(err, count){
      if (err) return next(err);
      if (count > 0) {
        BigBagWord.findOne({ type: "allw" }, function(err, bigBagWord){
          var bigBag = bigBagWord.allWords;
          for (var word in genbagofwords) {
            if (bigBag[word] == "" || bigBag[word] == undefined) {
              bigBag[word] = 1;
            } else {
              bigBag[word]++;
            }
          }
        });
      } else {
        var bigBagWord = new BigBagWord({ type: "allw", allWords: genbagofwords });
        bigBagWord.save(function(err, bigBagWord){
          if (err) return console.error('ERR[bigbagwords]: ' + err);
        });
      }
    });
  }

  var newDocs = [];

  CatBagWord.find().exec(function(err, catBagWords){
    catBagWords.forEach(function(catBagWord){
      newDocs[catBagWord.category] = catBagWord;
    });

    categories.forEach(function(cat){
      doc = newDocs[cat];
      doc.count++;
      for(var word in genbagofwords) {
        if(doc.bagOfWords[word] == "" || doc.bagOfWords[word] == undefined) {
          doc.bagOfWords[word] = 1;
        } else {
          doc.bagOfWords[word]++;
        }
      }
      newDocs[cat] = doc;
    });

    CatBagWord.findOneAndUpdate({ category: 'officespace' }, { category: 'asdasd' }, function(err, catBagWord){ /* empty */ });

    res.send('Word counts updated.');
  });
}

exports.reclassify = function(req, res) {
  // classify the documents
  var smoothing = 1;
  var posts = req.body.posts;
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var bagwords = utils.getbagofwords(utils.stemwords(post.split(" ")));
    
    /* categorize each post into the categories
    * P(C|D) = P(C)*P(D|C)/P(D)
    * where, D is a collection of independent words, so
        P(D|C) = P(w1|C)*P(w2|C)*...
    * and P(D) is constant, so we don't need to calculate that.
    */
    var p = 0, tempp = 1, category = "";
    for(var i = 0; i < utils.categories.length; i++) {
      CatBagWord.findOne({ category: utils.categories[i] }, function(err, catBagWord){
        for(var j=0; j<bagwords.length; j++) {
          tempp *= catBagWord.bagOfWords[bagwords[j]]+smoothing;
        }
        tempp *= d.count;
        
        if (tempp > p) {
          p = tempp;
          category = utils.categories[i];
        }
      });
    }
    
    // we have category now, save it
    ForumData.update(
      { category: category },
      { $push : 
        { posts : 
            { $each : [{
                user : "someone",
                datePosted : "today",
                content : post
              }]
            }
        }
      },
      function(err, docs, numAffected){ /* empty */ }
    );              
   }
}
