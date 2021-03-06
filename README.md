Sports Travel API
=========

Backend service for the Sports Travel visualization

  - Utilizes the SportsData API for input
  - Calculates and produces travel plans for MLB, NBA, NFL and NHL teams
  - REST-based JSON API

Config
-----------

You must specify your own SportsData API keys in config.js. You only need to provide keys for the sports you want data for.

Usage
--------------

* http://localhost:8888/leagues - retrieves a list of configured leagues
* http://localhost:8888/[league]/seasons - gets a list of seasons available for the specified league
* http://localhost:8888/[league]/[season]/teams - gets a list of teams available for the specified season
* http://localhost:8888/[league]/[season]/[team] - gets the travel schedule for the specified team

Caching
-------

Even though it may technically violate the SportsData API terms of service, the app will automatically cache all requests for future use during the life of the node process. ( Nothing is written to disk )

License
----
MIT