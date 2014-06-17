module.exports = function() {
  var next = arguments[arguments.length - 1],
      league = arguments[0].toLowerCase();

  if( league === "leagues" ) {
    this.res.end(JSON.stringify(Object.keys(this.api.data)));
  } else {
    if( !this.api.data.hasOwnProperty(league) ) {
      this.res.end(JSON.stringify({'err': '"' + league + '" is not a valid league. See /leagues for available leagues'}));
    } else {
      this.res.league = league;
      this.api.data[league] = {};
      var seasons = this.api.config[league].seasons
      for( var season in seasons ) {
        this.api.data[league][seasons[season]] = {};
      }
      next();
    }
  }
};