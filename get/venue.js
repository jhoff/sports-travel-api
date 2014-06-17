var sportsdata = require('../sportsdata');

module.exports = function(league,season,callback) {
  var bridge = new sportsdata(this.config);

  // populate the data object based on league / season
  console.log( "fetching venues for " + league + ", " + season );
  switch(league) {
    case 'mlb':
      bridge.fetch( league, '/venues/venues.xml', function(result) {
        var data = result.venues.venue,
            venues = {};

        for( var i in data ) {
          // the mlb venue data comes with dummy venues for some reason, so we need to filter out the ones with no market
          if( data[i].$.market !== '' ) {
            // market doesn't mean actual city, so we need to help google by telling it the stadium is "near" the market for it's team
            // I.E. The Rays Tropicana Field has a market of "Tampa Bay" while it's actually located in St. Petersburg
            venues[data[i].$.id] = data[i].$.name + ' near ' + data[i].$.market;
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