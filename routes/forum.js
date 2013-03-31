exports.show = function(req, res) {
  // get all categories, show them
  var c = req.path.split("/")[1];
  // TODO: check if category is valid

  var query = model.forumdata.find({category:c});
  query.limit(10).exec(function(err, docs) {
    res.render('forum', {data:{categories: utils.categories, posts:docs}});
  });
}
