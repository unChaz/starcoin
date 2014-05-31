angular.module('starcoinApp').controller('MatchupController', function($scope, $state, $stateParams, $http) {

  var baseURL = "http://chaz.bp:3000/api/matchups/";

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
    });
  }

  if($stateParams.id) {
    loadMatchup($stateParams.id);
  }

  $scope.test = "PARAMS: " + JSON.stringify($stateParams);

  $scope.getMatchup = function(){
    loadMatchup($scope.matchupId);
  };

  $scope.createMatchup = function(){
    var params = {
      region: $scope.region,
      winCondition: $scope.winCondition,
      start: $scope.startTime,
      name: $scope.name,
      gameType: $scope.gameType
    }

    $http.post(baseURL + "new",params).
    success(function(data) {
        $scope.matchup = data;
        $scope.matchupPrivateToken = data.privateToken;
        $state.transitionTo('matchups', {id: data.privateToken})
    }).error(function(data){
      $scope.errMsg = data;
    });
  };

  $scope.joinMatchup = function(){
    if ($scope.matchupPrivateToken) {
      var params = {
        bnetUrl: $scope.playerURL,
        team: $scope.team,
        bitcoinAddress: $scope.bitcoinAddress
      }
      console.log(params)
      $http.post(baseURL + $scope.matchupPrivateToken + "/join", params).
      success(function(data) {
          $scope.response = data;
      }).error(function(data){
      $scope.errMsg = data;
    });
    }
  };
});
