var ForumData = require('../models/forumData');

exports.show = function(req, res, next){
  // get all categories, show them
  var c = req.params.category;

  ForumData
    .find({ category: c })
    .limit(10)
    .exec(function(err, docs){
      res.render('forum', { data: { categories: utils.categories, posts: docs } });
    });
}