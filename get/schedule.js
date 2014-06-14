var sportsdata = require('../sportsdata');

var schedule_cache = {}

// http://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key
var sortByStart = function(a, b){
  var keyA = new Date(a.start),
  keyB = new Date(b.start);
  // Compare the 2 dates
  if(keyA < keyB) return -1;
  if(keyA > keyB) return 1;
  return 0;
};

module.exports = function(sport,season,team,callback) {
  var bridge = new sportsdata(this.config);

  // check the cache
  if( !schedule_cache[sport + season + team] ) {

    // populate the data object based on sport / season
    console.log( "fetching schedule for " + sport + ", " + season + ", " + team );
    switch(sport) {
      case 'mlb':
        bridge.fetch( sport, '/schedule/' + season + '.xml', function(result) {
          var events = result.calendars.event,
              teamData = this.data[sport][season].teams[team],
              homeVenue = this.data[sport][season].venues[teamData.venue],
              games = [];

          for( var i in events ) {
            var e = events[i]
            if( ( e.$.home === teamData.id || e.$.visitor === teamData.id ) && this.data[sport][season].venues[e.$.venue] ) {
              games.push({
                start: e.scheduled_start[0],
                id: e.$.id,
                visitor: this.data[sport][season].teamMap[e.$.visitor],
                home: this.data[sport][season].teamMap[e.$.home],
                venue: this.data[sport][season].venues[e.$.venue],
              });
            }
          }

          games.sort(sortByStart);

          schedule_cache[sport + season + team] = calculateTravel( homeVenue, games );

          callback(schedule_cache[sport + season + team]);
        }.bind(this));
        break;
      case 'nfl':
        bridge.fetch( sport, '/' + season + '/reg/schedule.json', function(result) {
          var weeks = result.weeks,
              homeVenue = null,
              games = [];

          // normalize the data into a list of games
          for( var w in weeks ) {
            for( var g in weeks[w].games ) {
              var e = weeks[w].games[g];
              if( e.home === team.toUpperCase() || e.away === team.toUpperCase() ) {
                if( homeVenue === null && e.home === team.toUpperCase() ) { homeVenue = e.venue.name + ', ' + e.venue.city; }
                games.push({
                  start: e.scheduled,
                  id: e.id,
                  visitor: e.away.toLowerCase(),
                  home: e.home.toLowerCase(),
                  venue: e.venue.name + ', ' + e.venue.city,
                });
              }
            }
          }
          
          // sort the games by start date
          games.sort(sortByStart);

          schedule_cache[sport + season + team] = calculateTravel(homeVenue, games, true);

          callback( schedule_cache[sport + season + team] );
        }.bind(this));
        break;
      case 'nhl':
      case 'nba':
        bridge.fetch( sport, '/games/' + season + '/reg/schedule.xml', function(result) {

          var events = result.league['season-schedule'][0].games[0].game,
              homeVenue = null,
              games = [];

          // normalize the data into a list of games
          for( var v in events ) {
            var e = events[v];
            if( e.home[0].$.alias === team.toUpperCase() || e.away[0].$.alias === team.toUpperCase() ) {
              if( homeVenue === null && e.home[0].$.alias === team.toUpperCase() ) { homeVenue = e.venue[0].$.name + ', ' + e.venue[0].$.city; }
              games.push({
                start: e.$.scheduled,
                id: e.$.id,
                visitor: e.away[0].$.name.toLowerCase(),
                home: e.home[0].$.name.toLowerCase(),
                venue: e.venue[0].$.name + ', ' + e.venue[0].$.city,
              });
            }
          }
          
          // sort the games by start date
          games.sort(sortByStart);

          schedule_cache[sport + season + team] = calculateTravel(homeVenue, games);
          callback( schedule_cache[sport + season + team] );
        }.bind(this));
        break;
      default:
        callback({});
    }
  } else {
    callback(schedule_cache[sport + season + team]);
  }

};

// takes a game list and calculates the travel schedule
function calculateTravel( homeVenue, games, homeBetweenGames ) {
  var homeBetweenGames = homeBetweenGames || false,
      travel = [homeVenue];

  // every time the venue changes, the venue to the stack
  for( var i in games ) {
    if( travel[travel.length - 1] !== games[i].venue ) {
      travel.push(games[i].venue);
    }
    if( homeBetweenGames && games[i].venue !== homeVenue ) {
      travel.push(homeVenue);
    }
  }
  
  if( travel[travel.length - 1] !== homeVenue ) {
    travel.push(homeVenue);
  }
  
  return travel;
}