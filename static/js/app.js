var groceryApp = angular.module('groceryApp', ['ngResource', 'ngRoute', 'ngAnimate']);

groceryApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: '../html/grocery/list.html',
        controller: 'GroceryListCtrl'
    }).
    when('/new', {
        templateUrl: '../html/grocery/new.html',
        controller: 'GroceryItemAddCtrl'
    }).
    when('/:itemId/edit', {
        templateUrl: '../html/grocery/edit.html',
        controller: 'GroceryItemEditCtrl'
    }).
    when('/about', {
        templateUrl: '../html/static/about.html',
        controller: 'AboutCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });
}]);

