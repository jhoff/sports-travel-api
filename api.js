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
  for( var league in this.config ) {
    if( !this.config.hasOwnProperty(league) ) { continue; }
    if( this.config[league] !== null ) {
      this.data[league] = [];
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
    '/:league': { get: this.routeLeague,
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
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
    router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify({'err':err}));
      } else {
        res.end();
        console.log(req.connection.remoteAddress + " " + req.url );
      }
    });
  });

  // start the server
  server.listen(this.port);
  console.log("Server running at http://127.0.0.1:" + this.port);
}

api.prototype.routeLeague = require('./route/league');
api.prototype.routeSeason = require('./route/season');
api.prototype.routeTeam = require('./route/team');

module.exports = api;