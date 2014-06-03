angular.module('starcoinApp').controller('MatchupController', function($scope, $state, $stateParams, $http) {

  var baseURL = "http://chaz.bp:3000/api/matchups/";

  $scope.matchup = null;

  $scope.nomatchup = function() {
    return $scope.matchup == null;
  }

  function loadMatchup(id) {
    $http.get(baseURL + id).
    success(function(data) {
      $scope.matchup = data;
      if (data.privateToken) {
        $scope.matchupPrivateToken = data.privateToken;
      }
      if (data.ended == true) {
        $scope.status = "Finished";
      } else if (new Date(data.start) > new Date()) {
        var time = new Date(data.start);
        $scope.status = "Starts at " + time.toDateString() + " " + time.toTimeString();
      }
      $scope.qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + data.bitcoinAddress;
      $scope.matchupLoaded = true;
      $scope.nomatchup = false;
      $scope.matchupnotstarted = true;
      if (data.started) $scope.matchupnotstarted = false;
      $scope.matchup.teams.forEach(function(team){
        team.players.forEach(function(player){
          if (player.career.league == "BRONZE") {
            player.borderColor = "#B89300";
          } else if (player.career.league == "SILVER") {
            player.borderColor = "#C0C0C0";
          } else if (player.career.league == "GOLD") {
            player.borderColor = "#E6E68A";
          } else if (player.career.league == "DIAMOND") {
            player.borderColor = "#0000FF";
          } else if (player.career.league == "PLATINUM") {
            player.borderColor = "#B3B3B3";
          } else if (player.career.league == "MASTER") {
            player.borderColor = "#5C00E6";
          } else if (player.career.league == "GRANDMASTER") {
            player.borderColor = "#E68A2E";
          }
        });
      });
    }).error(function(data){
      $scope.errMsg = "Not Found";
    });
  }

  if($stateParams.id) {
    loadMatchup($stateParams.id);
  }

  $scope.getMatchup = function(){
    loadMatchup($scope.matchupId);
  };

  $scope.createMatchup = function(params){
    var params = {
      region: params.region,
      winCondition: params.winCondition,
      start: params.startTime,
      name: params.name,
      gameType: params.gameType
    }

    if (!params.region || !params.winCondition || !params.name || !params.gameType) {
      $scope.createFormError = "All fields required.";
    } else {
      $http.post(baseURL + "new",params).
      success(function(data) {
        $('#joinModal').modal('hide');
        $scope.matchup = data;
        $scope.matchupPrivateToken = data.privateToken;
        $state.transitionTo('matchups', {id: data.privateToken});
      }).error(function(data){
        $scope.createFormError = data;
      });
    }
  };

  $scope.joinMatchup = function(playerParams){
    if ($scope.matchupPrivateToken) {
      var params = {
        bnetUrl: playerParams.playerURL,
        team: playerParams.team,
        bitcoinAddress: playerParams.bitcoinAddress
      }

      if(!params.bnetUrl || !params.team ||!params.bitcoinAddress) {
        $scope.joinFormError = "All fields required.";
      } else {
        $http.post(baseURL + $scope.matchupPrivateToken + "/join", params).
        success(function(data) {
          window.location.reload();
        }).error(function(data){
          $scope.joinFormError = "Not Found";
        });;
      }
    }
  };
});
