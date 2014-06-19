var sportsdata = require('../sportsdata');

module.exports = function(league,season,callback) {
  var bridge = new sportsdata(this.config);

  // populate the data object based on league / season
  switch(league) {
    case 'mlb':
      bridge.fetch( league, '/teams/' + season + '.xml', function(result) {
        var data = result.teams.team,
            teams = {};

        for( var i in data ) {
          if( !data.hasOwnProperty(i) ) { continue; }
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
          if( !data.conferences.hasOwnProperty(c) ) { continue; }
          for( var d in data.conferences[c].divisions ) {
            if( !data.conferences[c].divisions.hasOwnProperty(d) ) { continue; }
            for( var t in data.conferences[c].divisions[d].teams ) {
              if( !data.conferences[c].divisions[d].teams.hasOwnProperty(t) ) { continue; }
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
          if( !data.league.conference.hasOwnProperty(c) ) { continue; }
          for( var d in data.league.conference[c].division ) {
            if( !data.league.conference[c].division.hasOwnProperty(d) ) { continue; }
            for( var t in data.league.conference[c].division[d].team ) {
              if( !data.league.conference[c].division[d].team.hasOwnProperty(t) ) { continue; }
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