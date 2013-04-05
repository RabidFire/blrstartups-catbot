var mongoose = require('mongoose');
var model = require('../model');
var utils = require('../utils');
var Snowball = require('snowball');

exports.list = function(req, res) {
  //res.render('postsview', {title:'Posts'});
  res.render('plain', {title:'Posts'});
};

exports.store = function(req, res) {
  // push it to db
  mongoose.connect('localhost', 'bdb');
  var fbdata = new model.fbdata({data:JSON.stringify(req.body)});
  fbdata.save(function(err) {
    if(err) handleError(err);
  });
  mongoose.disconnect();
  res.send('ok');
};


/*
 * renders recent fb data on screen 
 */
exports.train = function(req, res) {
  // get only the latest stored data, train on it
  mongoose.connect('localhost', 'bdb');
  var fbdata = model.fbdata;

  var categories = utils.categories;

  // query to get the latest day's worth of json
  var query = fbdata.find();
  query.sort('-date').limit(1).exec(function(err, posts) {
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


/*
 * User has manually categorized posts. Save it.
 */
exports.trainsave = function(req, res) {
  // sent through form data
  var categories = req.body.cat;
  var descriptions = req.body.desc;
  
  if(categories.length != descriptions.length) {
    res.send('ERR[trainsave]: Categories length, descriptions length are not equal o_0');
  }

  mongoose.connect('localhost', 'bdb');

  var stemmer = new Snowball('English');

  for(var i=0; i<categories.length; i++) {
    var cat = categories[i];
    // stemming and stopwords
    var dwords = utils.stemwords(stemmer, descriptions[i]);

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
        if(err) {
          console.log('ERR[bigbagwords]: ' + err);
        }
      });
    }
  }

  var newdocs=[];
  var query = model.catbagwords.find({});
  var promise = query.exec(function(err, docs) {
    for(var i=0; i<docs.length; i++) {
      newdocs[docs[i].category] = docs[i];
    }
    
    var doc;
    categories.forEach(function(cat) {
      doc = newdocs[cat];
      doc.count++;
      for(var word in genbagofwords) {
        if(doc.bagofwords[word] == "" || doc.bagofwords[word] == undefined) {
          doc.bagofwords[word] = 1;
        } else {
          doc.bagofwords[word]++;
        }
      }
      newdocs[cat] = doc;
    });
  });
  promise.addCallback(function() {
    var db = mongoose.createConnection('localhost', 'bdb');
    var m = db.model('catbagwords');
    m.findOneAndUpdate({"category":"officespace"}, {"category":"asdasd"});
    /*for(var i=0; i<categories.length; i++) {
      var c = categories[i];
      m.update({"category":c}, {"category":"asdasd"});
    }*/
  });
  
  
  mongoose.disconnect();

  res.send('Word counts updated.');
}

exports.reclassify = function(req, res) {
  // classify the documents
  mongoose.connect('localhost', 'bdb');

  var smoothing = 1;
  var posts = req.body.posts;
  for(var i=0; i<posts.length; i++) {
    var post = posts[i];
    var bagwords = utils.getbagofwords(
            utils.stemwords(post.split(" ")));
    
    /* categorize each post into the categories
    * P(C|D) = P(C)*P(D|C)/P(D)
    * where, D is a collection of independent words, so
        P(D|C) = P(w1|C)*P(w2|C)*...
    * and P(D) is constant, so we don't need to calculate that.
    */
    var p = 0, tempp = 1, category = "";
    for(var i=0; i<utils.categories.length; i++) {
      model.catbagwords.find({category:utils.categories[i]}, function(err, docs) {
        var d = docs[0];
        for(var j=0; j<bagwords.length; j++) {
          tempp *= d.catbagwords[bagwords[j]]+smoothing;
        }
        tempp *= d.count;
        
        if(tempp > p) {
          p = tempp;
          category = utils.categories[i];
        }
      });
    }
    
    // we have category now, save it
    model.forumdata.update(
      {category:category},
      {$push : 
        {posts : 
            {$each : [{
                user : "someone",
                datePosted : "today",
                content : post
                }]
            }
        }
      }
    );              
   }

   mongoose.disconnect();
}
