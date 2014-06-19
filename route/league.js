module.exports = function() {
  var next = arguments[arguments.length - 1],
      league = arguments[0].toLowerCase();

  if( league === "leagues" ) {
    this.res.write(JSON.stringify(Object.keys(this.api.data)));
    next();
  } else {
    if( !this.api.data.hasOwnProperty(league) ) {
      next('"' + league + '" is not a valid league. See /leagues for available leagues');
    } else {
      this.res.league = league;
      this.api.data[league] = {};
      var seasons = this.api.config[league].seasons
      for( var season in seasons ) {
        if( !seasons.hasOwnProperty(season) ) { continue; }
        this.api.data[league][seasons[season]] = {};
      }
      next();
    }
  }
};