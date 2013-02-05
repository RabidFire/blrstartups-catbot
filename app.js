
/**
 * Module dependencies.
 */

var url = "https://graph.facebook.com";
var groupid = "220266924662120";
var access_token = "AAACEdEose0cBAFWf4EXZBqf1XjZBH3NwC8aPwZBHPPHXUloqiId1tYjp1Xe2VLmILtQaZCjb5CYEOUS1WbT6ag5VZBcZCMhr2hQ3dUzGAp8AZDZD";

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

app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/fbposts', fbposts.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
