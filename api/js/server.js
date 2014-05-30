var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var connectUtils = require('connect/lib/utils');
var config = require('./config');

var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static('./public'));

  // Routing
  app.use(app.router);

  // Error handling
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
});

var appServer = http.createServer(app);

mongoose.connect(config.dbURI);

appServer.listen(config.port);

module.exports = app;
