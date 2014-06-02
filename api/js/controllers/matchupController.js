function spec(b) {
  var Matchup = b.Matchup || require('../schemas/matchup').class();
  var matchupMonitor = b.MatchupMonitor || require('../matchupMonitor').new();
  //var Wallet = b.Wallet || require('../schemas/wallet').class();
  var config = require('../config');

  var MatchupController = function(app) {
    this.app = app;
  }

  MatchupController.prototype.create = function(req, res) {
    var self = this;
    console.log("Create Matchup")

    var matchup = new Matchup();
    matchup.name = req.body['name'];
    matchup.region = req.body['region'];
    matchup.start = req.body['start'] || Date.now();
    matchup.winCondition = req.body['winCondition'];
    matchup.results = [];

    var gameType = req.body['gameType'];
    if (gameType === "1V1") {
      matchup.maxPlayers = 2;
      matchup.gameType = gameType;
    } else if (gameType === "2V2") {
      matchup.maxPlayers = 4;
      matchup.gameType = gameType;
    } else if (gameType === "3V3") {
      matchup.maxPlayers = 6;
      matchup.gameType = gameType;
    } else if (gameType === "4V4") {
      matchup.maxPlayers = 8;
      matchup.gameType = gameType;
    } else if (gameType === "FFA") {
      matchup.maxPlayers = 10;
      matchup.gameType = gameType;
    } else {
      console.log("error creating matchup: " + JSON.stringify(req.body));
      return res.send(500, "must supply a game type");
    }

    if (!matchup.region) {
      console.log("error creating matchup: " + req.body);
      return res.send(500, "must supply a region");
    }
    matchup.generatePrivateToken();
    matchup.generatePublicToken();
    
    matchup.save(function(err){
      return res.send(200, self._filter(matchup, 'privateToken'));
    });  
  };

  MatchupController.prototype.join = function(req, res) {
    var self = this;
    var type;
    var token = req.params['token']

    if (token.length == 22){
      type = 'privateToken';
    } else {
      return res.send(404);
    }

    if(!req.body.bnetUrl) {
      console.log("error joining matchup: " + req.body);
      return res.send(500, "must supply a valid battlenet url")
    }

    filters = {'privateToken': token};

    Matchup.findOne(filters, function(err, matchup){
      if (err) console.log(err);
      if(matchup){
        var playerURL = req.body.bnetUrl;
        var splitURL  = playerURL.split("/profile/");
        var credentials = splitURL[1].split("/");
        var params = {
          webId: credentials[0],
          realm: credentials[1],
          name: credentials[2],
          region: matchup.region
        }

        var teamName;
        if(matchup.gameType === "FFA" || matchup.gameType === "1V1") {
            teamName = params.name;
        } else {
            teamName = req.body.team;
        }
        if (!teamName) {
          console.log("error joining matchup: " + req.body);
          return res.send(500, "Must specify a team name");
        }


        matchupMonitor.getPlayerData(params, function(err, player) {
          if (err || !player) {
            console.log("player not found " + player);
            return res.send(404, "player not found");
          }

          matchup.addPlayer(player, teamName, function(err) {
              if (err) {
                console.log("error joining matchup: " + err);
                return res.send(500, err);
              }
              matchup.save(function(err){
                  if(err) {
                    console.log("error saving matchup: " + err);
                    return res.send(500);
                  }
                  return res.send(200, "player joined");
              });        
          });
        });
      } else {
        return res.send(404, "matchup not found.");
      }
    }); 
  };

  MatchupController.prototype.get = function(req, res) {
    var self = this;
    var token = req.params['token'];
    var filters = {};
    var type;

    if(token.length == 20){
      type = 'publicToken';
    } else if (token.length == 22){
      type = 'privateToken';
    } else {
      res.send(404);
    }

    filters[type] = token;

    Matchup.findOne(filters, function(err, matchup){
      if (err) console.log(err);
      if(matchup){
        // Update the matchup (until we build a cron job to do it).
        if(matchup.start < Date.now() && matchup.teams.length > 1) {
          matchupMonitor.updateMatchup(matchup, function(err, matchup) {
            if (err) {
              console.log(err);
              return res.send(500, "error updating matchup");
            }
            return res.send(self._filter(matchup, type));
          });
        } else {
          console.log("match hasn't started");
          return res.send(self._filter(matchup, type));
        }     
      } else {
        return res.send(404, "matchup not found.");
      }
    });
  };

  MatchupController.prototype._filter = function(matchup, type){
    m = matchup.toObject();
    delete m["_id"];
    delete m["__v"];
    if (type === "publicToken"){
      delete m["privateToken"];
    }
    return m;
  }

  return MatchupController;
}

module.defineClass(spec);