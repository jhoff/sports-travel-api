var getTeams = require('../get/team');

module.exports = function() {
  var next = arguments[arguments.length - 1],
      league = arguments[0].toLowerCase(),
      season = arguments[1],
      seasonInt = parseInt(arguments[1],10);

  if( season.toLowerCase() === "seasons" ) {
    this.res.write(JSON.stringify(Object.keys(this.api.data[league])));
    next();
  } else {
    seasonInt = parseInt(season,10);
    if ( !this.api.data[league].hasOwnProperty(seasonInt) ) {
      next("'" + season + "' is not a valid season. See /" + league + "/seasons");
    } else {
      this.res.season = seasonInt;
      getTeams.call(this.api,league,seasonInt,function(teams){

        var map = {};
        for( var i in teams ) {
          if( !teams.hasOwnProperty(i) ) { continue; }
          var identifier = teams[i].abbr || teams[i].alias || teams[i].id; // yay data inconsistency
          map[teams[i].id] = identifier.toLowerCase();
        }

        this.api.data[league][season].teamMap = map;
        this.api.data[league][season].teams = teams;

        next();

      }.bind(this));
    }
  }
};