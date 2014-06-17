var getTeams = require('../get/team');

module.exports = function() {
  var next = arguments[arguments.length - 1],
      league = arguments[0].toLowerCase(),
      season = arguments[1],
      seasonInt = parseInt(arguments[1],10);

  if( season.toLowerCase() === "seasons" ) {
    this.res.end(JSON.stringify(Object.keys(this.api.data[league])));
  } else {
    seasonInt = parseInt(season,10);
    if ( !this.api.data[league].hasOwnProperty(seasonInt) ) {
      this.res.end(JSON.stringify({'err': "'" + season + "' is not a valid season. See /" + league + "/seasons"}));
    } else {
      this.res.season = seasonInt;
      getTeams.call(this.api,league,seasonInt,function(teams){

        var map = {};
        for( var i in teams ) {
          map[teams[i].id] = teams[i].market + ' ' + teams[i].name;
        }

        this.api.data[league][season].teamMap = map;
        this.api.data[league][season].teams = teams;

        next();

      }.bind(this));
    }
  }
};