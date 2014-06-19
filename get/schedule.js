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

module.exports = function(league,season,team,callback) {
  var bridge = new sportsdata(this.config);

  // check the cache
  if( !schedule_cache[league + season + team] ) {

    // populate the data object based on league / season
    switch(league) {
      case 'mlb':
        bridge.fetch( league, '/schedule/' + season + '.xml', function(result) {
          var events = result.calendars.event,
              teamData = this.data[league][season].teams[team],
              homeVenue = this.data[league][season].venues[teamData.venue].search,
              games = [];

          for( var i in events ) {
            if( !events.hasOwnProperty(i) ) { continue; }
            var e = events[i],
                homeId = this.data[league][season].teamMap[e.$.home],
                awayId = this.data[league][season].teamMap[e.$.visitor],
                venue = this.data[league][season].venues[e.$.venue];

            if( ( homeId === team || awayId === team ) && venue ) {
              games.push({
                start: e.scheduled_start[0],
                id: e.$.id,
                visitor: this.data[league][season].teams[awayId],
                home: this.data[league][season].teams[homeId],
                venue: venue
              });
            }
          }

          games.sort(sortByStart);

          schedule_cache[league + season + team] = {
            venues: uniqueVenues( homeVenue, games ),
            travel: calculateTravel( homeVenue, games ),
          };

          callback(schedule_cache[league + season + team]);
        }.bind(this));
        break;
      case 'nfl':
        bridge.fetch( league, '/' + season + '/reg/schedule.json', function(result) {
          var weeks = result.weeks,
              homeVenue = null,
              games = [];

          // normalize the data into a list of games
          for( var w in weeks ) {
            if( !weeks.hasOwnProperty(w) ) { continue; }
            for( var g in weeks[w].games ) {
              if( !weeks[w].games.hasOwnProperty(g) ) { continue; }
              var e = weeks[w].games[g],
                  homeId = e.home.toLowerCase(),
                  awayId = e.away.toLowerCase();

              if( homeId === team || awayId === team ) {
                if( homeVenue === null && homeId === team ) { homeVenue = e.venue.name + ', ' + e.venue.city + ' ' + e.venue.zip; }
                games.push({
                  start: e.scheduled,
                  id: e.id,
                  visitor: this.data[league][season].teams[awayId],
                  home: this.data[league][season].teams[homeId],
                  venue: {
                    search: e.venue.name + ', ' + e.venue.city + ' ' + e.venue.zip,
                    info: e.venue
                  }
                });
              }
            }
          }
          
          // sort the games by start date
          games.sort(sortByStart);

          schedule_cache[league + season + team] = {
            venues: uniqueVenues( homeVenue, games ),
            travel: calculateTravel( homeVenue, games, true )
          };

          callback( schedule_cache[league + season + team] );
        }.bind(this));
        break;
      case 'nhl':
      case 'nba':
        bridge.fetch( league, '/games/' + season + '/reg/schedule.xml', function(result) {

          var events = result.league['season-schedule'][0].games[0].game,
              homeVenue = null,
              games = [];

          // normalize the data into a list of games
          for( var v in events ) {
            if( !events.hasOwnProperty(v) ) { continue; }
            var e = events[v],
                homeId = this.data[league][season].teamMap[e.home[0].$.id],
                awayId = this.data[league][season].teamMap[e.away[0].$.id];

            if( homeId === team || awayId === team ) {

              // some NBA games are played in Mexico and London, so we need to make sure the venue is structured properly in all cases
              if( e.venue[0].$.country === 'USA' ) {
                var vsearch = e.venue[0].$.address + ', ' + e.venue[0].$.city + ' ' + e.venue[0].$.state + ', ' + e.venue[0].$.zip + ', USA';
              } else {
                var vsearch = e.venue[0].$.address + ', ' + e.venue[0].$.city;
                if( e.venue[0].$.state ) { vsearch += ' ' + e.venue[0].$.state; }
                if( e.venue[0].$.country === 'GBR' ) { vsearch += ', Great Britain'; } else { vsearch += ', ' + e.venue[0].$.country }
                if( e.venue[0].$.zip ) { vsearch += ' ' + e.venue[0].$.zip; }
              }

              if( homeVenue === null && homeId === team ) { homeVenue = vsearch; }

              games.push({
                start: e.$.scheduled,
                id: e.$.id,
                visitor: this.data[league][season].teams[awayId],
                home: this.data[league][season].teams[homeId],
                venue: {
                  search: vsearch,
                  info: e.venue[0].$
                }
              });

            }
          }
          
          // sort the games by start date
          games.sort(sortByStart);

          schedule_cache[league + season + team] = {
            venues: uniqueVenues( homeVenue, games ),
            travel: calculateTravel( homeVenue, games )
          };

          callback( schedule_cache[league + season + team] );
        }.bind(this));
        break;
      default:
        callback({});
    }
  } else {
    callback(schedule_cache[league + season + team]);
  }

};

// takes a game list and calculates the travel schedule
function calculateTravel( homeVenue, games, homeBetweenGames ) {
  var homeBetweenGames = homeBetweenGames || false,
      travel = [homeVenue];

  // every time the venue changes, push the venue to the stack
  for( var i in games ) {
    if( !games.hasOwnProperty(i) ) { continue; }
    if( travel[travel.length - 1] !== games[i].venue.search ) {
      travel.push(games[i].venue.search);
    }
    if( homeBetweenGames && games[i].venue.search !== homeVenue ) {
      travel.push(homeVenue);
    }
  }
  
  if( travel[travel.length - 1] !== homeVenue ) {
    travel.push(homeVenue);
  }
  
  return travel;
}

function uniqueVenues( home, games ) {
  var unique = {};

  for( var i in games ) {
    if( !games.hasOwnProperty(i) ) { continue; }

    // make object copies so we don't alter refrences
    var game = JSON.parse(JSON.stringify( games[i] )),
        venue = JSON.parse(JSON.stringify( game.venue )),
        address = venue.search;

    // clean up the game object
    if( game.venue ) delete game.venue;
    if( game.visitor.venue ) delete game.visitor.venue;
    if( game.home.venue ) delete game.home.venue;

    // if we've haven't seen this venue yet, add a new entry;
    if( !unique[ address ] ) {
      // base venue info
      unique[ address ] = venue.info;
      // home team true / false
      if( address === home ) {
        unique[ address ].homeVenue = true;
      }
      // start a games array
      unique[ address ].games = [];
    }

    // add it to the list
    unique[ address ].games.push( game );
  }

  return unique;
}