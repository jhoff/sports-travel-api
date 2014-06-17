var request = require('request'),
    xml2js = require('xml2js'),
    xmlparser = new xml2js.Parser(),
    mostRecentQuery = 0,
    url_cache = {};

/**
 * Calls the proper sportsData api, converts and sanitizes the data appropriately
 *
 * @return array 
 */
function sportsdata(config) {
  this.config = config;
};

sportsdata.prototype.fetch = function( league, url, callback ) {
  if( !url_cache[league+url] ) {
    // make sure we don't make calls more frequently than every second, or it will fail.
    var timeToWait = ( Date.now() - mostRecentQuery < 1000 ? 1000 - ( Date.now() - mostRecentQuery ) : 1 );
    setTimeout( function() {
      request( this.prepareUrl( league, url ) , function (error, response, body) {
        mostRecentQuery = Date.now();
        if( error || response.statusCode !== 200) {
          console.log(error);
        }
        
        if( url.split('.').pop() === 'xml' ) {
          xmlparser.parseString(body, function (err, result) {
            url_cache[league+url] = result;
            callback( result );
          });
        } else {
          url_cache[league+url] = JSON.parse(response.body);
          callback( url_cache[league+url] );
        }
      });
    }.bind(this), timeToWait);
  } else {
    callback( url_cache[league+url] );
  }
}

sportsdata.prototype.prepareUrl = function( league, url ) {
  return "http://api.sportsdatallc.org/"
         + league
         + "-"
         + this.config[league].accesslevel
         + this.config[league].version
         + url
         + "?api_key="
         + this.config[league].key
}

module.exports = sportsdata;