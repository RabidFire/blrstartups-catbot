
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , fbposts = require('./routes/fbposts')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use('/js', express.static(__dirname + '/js'));
  app.use('/static', express.static(__dirname + '/static'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// initialize mongoose, db, etc
var model = require('./model');
model.init();

app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/fbposts', fbposts.list);
app.get('/train', fbposts.train);
app.post('/storeposts', fbposts.store);
app.post('/trainsave', fbposts.trainsave);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
