function spec(b) {
  var rest = b.restler || require('restler');
  var _ = b.underscore || require('underscore');
  var async = require('async');

  function MatchupMonitor() {

  };

  MatchupMonitor.prototype.updateMatchup = function(matchup, callback) {
    var self = this;
    console.log("Updating Matchup: " + matchup.publicToken);
    self._getMatches(matchup.teams, function(err, matches) {
      if (err) {
        console.log("Error getting matches" + err);
        if (callback) {
          return callback(err);
        }
      }
      if (matches) {
        var validMatches = self._pruneMatches(matches);
        var filteredMatches = self._filterBadResults(validMatches, matchup);
        var formattedMatches = self._formatResults(filteredMatches, matchup);

        matchup.updateMatches(formattedMatches, function(err){
          if(err) console.log(err);
          matchup.save(function(err) {
            if (err) {
              console.log(err);
              if (callback) {
                return callback(err);
              }
            }
            if(callback) {
              return callback(null, matchup);
            }
          });
        });
      } else {
        if(callback) {
          console.log("no matches");
          return callback(null, null);
        }
      }
      
    });
  };

  MatchupMonitor.prototype.getLatestMatches = function(player, callback) {
    var URL = 'http://' + player.region + '.battle.net/api/sc2/profile/' + player.webId + '/' + player.realm + '/' + player.name + '/matches';
    rest.get(URL).on('complete', function(data) {
      return callback(null, data);
    });
  };

  MatchupMonitor.prototype.getPlayerData = function(player, callback) {
    var URL = 'http://' + player.region + '.battle.net/api/sc2/profile/' + player.webId + '/' + player.realm + '/' + player.name + '/';
    rest.get(URL).on('complete', function(data) {
      if (data.code == 404) {
        return callback(null, null);
      }
      var response = {
        webId: data.id,
        realm: data.realm,
        region: player.region,
        name: data.displayName,
        portrait: data.portrait,
        career: data.career,
        swarmLevels: data.swarmLevels,
        clan: data.clanName,
        clanTag: data.clanTag,
        profile: data.profilePath,
      }
      return callback(null, response);
    });
  };

  MatchupMonitor.prototype._getMatches = function(teams, callback) {
    var self = this;
    var matches = [];

   
    var players = [];
    teams.forEach(function(team){
      players = players.concat(team.players);
    });
    async.forEach(players, function(player, next) {
      self.getLatestMatches(player, function(err, data) {
        if (err) console.log(err);
        if (data) {
          data.player = player.webId;
          matches.push(data);
        }
        next();
      });
    }, function(err) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        return callback(null, matches);
      }
    });

    
  };

  MatchupMonitor.prototype._pruneMatches = function(playerResults) {
    var prunedMatches = {};
    
    // Consolidate match data.
    playerResults.forEach(function(playerResult) {
      playerResult.matches.forEach(function(match) {
        if(prunedMatches[match.date]) {
          prunedMatches[match.date].results.push({
            player: playerResult.player,
            result: match.decision
          });
        } else {
          prunedMatches[match.date] = {
            map: match.map,
            type: match.type,
            results: [
              {
                player: playerResult.player,
                result: match.decision
              }
            ]
          }
        }
      });
    });

    var keys = _.keys(prunedMatches);
    // Delete matches that don't include all players.
    keys.forEach(function(date) {
      if(prunedMatches[date].results.length < playerResults.length) {
        delete prunedMatches[date];
      }
    });

    return prunedMatches;
  };

  MatchupMonitor.prototype._filterBadResults = function(results, matchup) {
    var self = this;
    var keys = _.keys(results);

    for(var i = 0; i<keys.length;i++) {
      if (matchup.gameType === "FFA") {
        if (!self._hasOnlyOneWinner(results[keys[i]])) {
          delete results[keys[i]];
        }
      } else {
        if(!self._onlyOneTeamWon(results[keys[i]], matchup.teams)) {
          delete results[keys[i]];
        }
      }
    }
    return results;
  };

  MatchupMonitor.prototype._hasOnlyOneWinner = function(results) {
    var winners = 0;
    results.results.forEach(function(result) {
      if(result.result === "WIN") {
        winners ++;
      }
    });
    return winners == 1;
  };

  MatchupMonitor.prototype._onlyOneTeamWon = function(results, teams) {
    var self = this;
    var scores = [0,0];
    results.results.forEach(function(result) {
      if(result.result === "WIN"){
        scores[self._getTeamNumber(result.player, teams)]++;
      }
    });

    if(scores[0] == 0) {
      return scores[1] == teams[1].players.length //every player won
    } else if(scores[1] == 0) {
      return scores[0] == teams[0].players.length //every player won
    } else {
      return false; //Both teams had a winning player
    }
  };

  MatchupMonitor.prototype._getTeamNumber = function(id, teams) {
    var self = this;
    var teamNumber = 0;
    var winner = 999; // Because JavaScript is a bitch. returning teamNumber on 192 returns undefined. #mindblown
    teams.forEach(function(team){
      team.players.forEach(function(player) {
        if(player.webId === id) {
          return teamNumber;
        }
      });
      teamNumber++;
    });
  }

  MatchupMonitor.prototype._formatResults = function(results, matchup) {
    var self = this;
    var resultsArr = [];
    var keys = _.keys(results);
    keys.forEach(function(key){
      var match = results[key];
      match.results.forEach(function(result) {
        if(result.result === 'WIN') {
          var winner = self._getTeamNumber(result.player, matchup.teams);
          resultsArr.push({
            time: key,
            winner: winner,
            type: results[key].type,
            map: results[key].map
          });
        }
      })
    });
    
    return resultsArr;
  };

  return MatchupMonitor;
};
module.defineClass(spec);
