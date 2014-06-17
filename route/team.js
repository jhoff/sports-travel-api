var getSchedule = require('../get/schedule'),
    getVenues   = require('../get/venue');

module.exports = function() {
  var next = arguments[arguments.length - 1],
      league = arguments[0].toLowerCase(),
      season = parseInt(arguments[1],10);
      team = arguments[2].toLowerCase();

  if( team.toLowerCase() === "teams" ) {
    var teams = {},
        keys = Object.keys(this.api.data[league][season].teams);
    for( var t in keys ) {
      teams[keys[t]] = this.api.data[league][season].teams[keys[t]].market + ' ' + this.api.data[league][season].teams[keys[t]].name;
    }
    this.res.end(JSON.stringify(teams));
  } else {
    if ( !this.api.data[league][season].teams.hasOwnProperty(team) ) {
      this.res.end(JSON.stringify({'err': "'" + team + "' is not a valid team. See /" + league + "/" + season + "/teams"}));
    } else {
      this.res.team = team;
      getVenues.call(this.api,league,season,function(venues){
        this.api.data[league][season].venues = venues;
        getSchedule.call(this.api,league,season,team,function(schedule){
          this.res.write(JSON.stringify(schedule));
          next();
        }.bind(this));
      }.bind(this));
    }
  }
};