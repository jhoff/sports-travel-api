module.exports = function() {
  var next = arguments[arguments.length - 1],
      sport = arguments[0].toLowerCase();

  if( sport === "sports" ) {
    this.res.end(JSON.stringify(Object.keys(this.api.data)));
  } else {
    if( !this.api.data.hasOwnProperty(sport) ) {
      this.res.end(JSON.stringify({'err': '"' + sport + '" is not a valid sport. See /sports for available sports'}));
    } else {
      this.res.sport = sport;
      this.api.data[sport] = {};
      var seasons = this.api.config[sport].seasons
      for( var season in seasons ) {
        this.api.data[sport][seasons[season]] = {};
      }
      next();
    }
  }
};