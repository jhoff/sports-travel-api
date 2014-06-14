var http = require('http'),
    director = require('director');

function api(port) {
  this.port = port || 8888;
  this.config = require('./config');
  this.data = {};
}

api.prototype.run = function() {
  this.parseConfig();
  this.start();
}

api.prototype.parseConfig = function() {
  for( var sport in this.config ) {
    if( this.config[sport] !== null ) {
      this.data[sport] = [];
    }
  }
  if( this.data.length === 0 ) {
    console.error('You must specify at least one API key in config.js!');
    process.exit(1);
  }
}

api.prototype.start = function() {
  // primary routing table
  var router = new director.http.Router({
    '/:sport': { get: this.routeSport,
      '/:season': { get: this.routeSeason,
        '/:team': { get: this.routeTeam }
      }
    }
  }).configure({
    recurse: 'forward',
    async: true
  });

  // attach a reference to our api instance to the router, so we can use it later.
  var context = this;
  router.attach(function () {
    this.api = context;
  });

  // create the server
  var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end('Page not found! ' + err);
      }
      res.end();
      console.log("Served: " + req.url );
    });
  });

  // start the server
  server.listen(this.port);
  console.log("Server running at http://127.0.0.1:" + this.port);
}

api.prototype.routeSport = require('./route/sport');
api.prototype.routeSeason = require('./route/season');
api.prototype.routeTeam = require('./route/team');

module.exports = api;