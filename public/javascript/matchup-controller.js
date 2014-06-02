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
      $scope.errMsg = "All fields required.";
    } else {
      $http.post(baseURL + "new",params).
      success(function(data) {
          $scope.matchup = data;
          $scope.matchupPrivateToken = data.privateToken;
          $state.transitionTo('matchups', {id: data.privateToken})
      }).error(function(data){
        $scope.errMsg = data;
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
        $scope.errMsg = "All fields required.";
      } else {
        $http.post(baseURL + $scope.matchupPrivateToken + "/join", params).
        success(function(data) {
          window.location.reload();
        }).error(function(data){
          $scope.errMsg = "Not Found";
        });;
      }
    }
  };
});
