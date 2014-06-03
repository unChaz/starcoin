var starcoinApp = angular.module('starcoinApp', ['ui.router'])
starcoinApp.config(function($stateProvider, $urlRouterProvider) {
    
  $urlRouterProvider.otherwise('/home');
  
  $stateProvider
    
    .state('home', {
        url: '/home',
        templateUrl: 'pages/home.html'
    })

    .state('matchups', {
        url: '/matchups/:id',
        templateUrl: 'pages/matchup.html',
        controller: 'MatchupController'      
    })

    .state('about', {
        url: '/about',
        templateUrl: 'pages/about.html'      
    });
      
});

starcoinApp.controller("index", ["$scope", function($scope) {
    $scope.appName = "StarCoin";
}]);