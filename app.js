
/**
 * Module dependencies.
 */

var express = require('express');
var http    = require('http');
var path    = require('path');

var routes  = require('./routes');
var fbposts = require('./routes/fbposts');
var forum   = require('./routes/forum');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/fbposts', fbposts.list);
app.get('/train', fbposts.train);
app.post('/storeposts', fbposts.store);
app.post('/trainsave', fbposts.trainsave);
app.get('/forum/:category', forum.show);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});