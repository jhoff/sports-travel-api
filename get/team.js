var sportsdata = require('../sportsdata');

module.exports = function(league,season,callback) {
  var bridge = new sportsdata(this.config);

  // populate the data object based on league / season
  console.log( "fetching teams for " + league + ", " + season );
  switch(league) {
    case 'mlb':
      bridge.fetch( league, '/teams/' + season + '.xml', function(result) {
        var data = result.teams.team,
            teams = {};

        for( var i in data ) {
          var team = data[i].$;
          if( team.venue !== '' && team.league !== '' ) {
            teams[team.abbr.toLowerCase()] = team;
          }
        }

        callback(teams);
      });
      break;
    case 'nfl':
      bridge.fetch( league, '/teams/hierarchy.json', function(data) {
        var teams = {};

        for( var c in data.conferences ) {
          for( var d in data.conferences[c].divisions ) {
            for( var t in data.conferences[c].divisions[d].teams ) {
              var team = data.conferences[c].divisions[d].teams[t];
              teams[team.id.toLowerCase()] = team;
            }
          }
        }

        callback(teams);
      });
      break;
    case 'nhl':
    case 'nba':
      bridge.fetch( league, '/league/hierarchy.xml', function(data) {
        var teams = {};

        for( var c in data.league.conference ) {
          for( var d in data.league.conference[c].division ) {
            for( var t in data.league.conference[c].division[d].team ) {
              var team = data.league.conference[c].division[d].team[t];
              teams[team.$.alias.toLowerCase()] = team.$;
              teams[team.$.alias.toLowerCase()].venue = team.venue[0].$;
            }
          }
        }
        
        callback(teams);
      });
      break;
    default:
      callback({});
  }
};