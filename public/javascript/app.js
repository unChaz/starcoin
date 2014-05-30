var starcoinApp = angular.module('starcoinApp', ['ui.router'])
starcoinApp.config(function($stateProvider, $urlRouterProvider) {
    
  $urlRouterProvider.otherwise('/home');
  
  $stateProvider
    
    .state('home', {
        url: '/home',
        templateUrl: 'pages/home.html'
    })
    
    .state('host', {
        url: '/matchups/new',
        templateUrl: 'pages/new-matchup.html'      
    })

    .state('join', {
        url: '/matchups/join',
        templateUrl: 'pages/join-matchup.html'      
    })

    .state('browse', {
        url: '/matchups/',
        templateUrl: 'pages/view-matchup.html'      
    })

    .state('about', {
        url: '/about',
        templateUrl: 'pages/about.html'      
    });
      
});

starcoinApp.controller("index", ["$scope", function($scope) {
    $scope.appName = "StarCoin";
}]);