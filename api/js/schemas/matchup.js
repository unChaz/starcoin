function spec(b) {
  var mongoose = require('mongoose');
  var ObjectID = require('mongodb').ObjectID;
  var Schema = mongoose.Schema;
  var Hashids = require("hashids");
  var config = require('../config');
  var hashids = new Hashids(config.credentials.encKey);
  var Encrypter = require('../encrypter').class();
  var encrypter = new Encrypter();
  var _ = b.underscore || require('underscore');

  var Matchup = new Schema({
    privateToken: {type: String, unique: true}, // to register players
    publicToken: {type: String, unique: true}, // For public data
    name: {type: String, default: "SC2 Matchup"},
    region: {type: String, default: "us"},
    teams: Array,
    start: Date,
    ended: {type: Boolean, default: false},
    winCondition: {type: Number, default: 3},
    results: Array,
    winners: Array,
    gameType: String,
    maxPlayers: Number,
    prizeAmount: {type: Number, default:0}
  });

  Matchup.methods.generatePrivateToken = function() {
    this.privateToken = encrypter.externId(this._id);
  };

  Matchup.methods.generatePublicToken = function() {
    this.publicToken = hashids.encryptHex(this._id);
  };

  Matchup.methods.updateMatches = function(matches, callback) {
    var self = this;
    var matchIndexes = self._getMatchIndexes(self.results);
    for(var i=0;i<matches.length;i++){
      if(matchIndexes[matches[i].time]) {
        delete matches[i];
      } else {
        self.teams[matches[i].winner].wins++;
        if(self.teams[matches[i].winner].wins == self.winCondition && !self.ended) {
          self.winners  = self.teams[matches[i].winner];
          self.ended = true;
        }
      }
    };
    matches.forEach(function(result){
      if(result != null) {
        self.results.push(result);
      }
    })
    return callback(null);
  };

  Matchup.methods.addPlayer = function(player, team, callback) {
    var self = this;

    if (self.gameType === "FFA" ){
      if(self.teams.length < self.maxPlayers) {
        self.teams.push(
          {
            name: player.name,
            wins: 0,
            players: [
              player
            ]
          }
        );
        return callback(null);
      } else {
        return callback("Matchup is full.");
      }
    } else if (self._getTeamNumber(team)) {
      var teamNumber = self._getTeamNumber(team);
      if(self.teams[teamNumber].players.length == (self.maxPlayers/2)) {
        return callback("Team is full");
      } else {
        self.teams[teamNumber].players.push(player);
        return callback();
      }
    } else {
      if(self.teams.length == 2) {
        return callback("There are already 2 teams");
      } else {
        self.teams.push(
          {
            name: team,
            wins: 0,
            players: [
              player
            ]
          }
        );
        return callback(null)
      }
    }
  };

  Matchup.methods._getTeamNumber = function(teamName) {
    var self = this;
    var i = 0;
    self.teams.forEach(function(team){
      if(team.name === teamName) {
        return i;
      }
      i++;
    });
    return null;
  };

  Matchup.methods._getMatchIndexes = function(matches) {
    var indexes = {};
    matches.forEach(function(match) {
      indexes[match.time] = true;
    });
    return indexes;
  }

  return Matchup = mongoose.model('Matchup', Matchup);
};

module.defineClass(spec);