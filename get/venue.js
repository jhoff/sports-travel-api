var sportsdata = require('../sportsdata');

module.exports = function(sport,season,callback) {
  var bridge = new sportsdata(this.config);

  // populate the data object based on sport / season
  console.log( "fetching venues for " + sport + ", " + season );
  switch(sport) {
    case 'mlb':
      bridge.fetch( sport, '/venues/venues.xml', function(result) {
        var data = result.venues.venue,
            venues = {};

        for( var i in data ) {
          if( data[i].$.market !== '' ) {
            venues[data[i].$.id] = data[i].$.name + ', ' + data[i].$.market;
          }
        }

        return callback(venues);
      });
      break;
    default:
      // venue information is combined with all other schedule data
      callback({});
  }
};