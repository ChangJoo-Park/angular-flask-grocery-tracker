var groceryApp = angular.module('groceryApp', ['ngResource', 'ngRoute']);

groceryApp.config(['$routeProvider',function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: '../html/grocery/list.html',
            controller: 'GroceryListCtrl'
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

groceryApp.factory('GroceryService', ['$http', function($http){
    var urlBase = '/api/groceries';
    var dataFactory = {};
    dataFactory.getGroceries = function() {
        return $http.get(urlBase);
    };

    dataFactory.getGrocery = function(id) {
        console.log("GET GROCERY");
        return $http.get(urlBase + "/" + id);
    };

    dataFactory.addGrocery = function(data) {
        return $http.post(urlBase, data);
    };

    dataFactory.deleteGrocery = function(data) {
        return $http.delete(urlBase + "/" + data.id);
    };

    dataFactory.updateGrocery = function(data) {
        return $http.put(urlBase + "/" + data.id, data);
    };

    return dataFactory;
}]);

// Controllers
groceryApp.controller('GroceryListCtrl', ['$scope', '$http', 'GroceryService',
                                 function($scope, $http, GroceryService){
    $scope.myWord = "Hello GroceryTracker";
    $scope.newGrocery = {};
    // GET
    // $scope.groceries = GroceryService.getGroceries();
    getGroceries();
    function getGroceries() {
        GroceryService.getGroceries().success(function(result){
            $scope.groceries = result.data;
        });
    }

    // POST
    function addGrocery() {
        var data = $scope.newGrocery;
        data.bought_at = moment(data.bought_at).format("YYYY-MM-DD");
        GroceryService.addGrocery(data).success(function(){
            getGroceries();
        });
        data = {};
    }
    $scope.addGrocery =  function () {
        addGrocery();
        $scope.newGrocery = {};
    }

    // PUT
    $scope.updateGrocery = function(grocery){
        GroceryService.updateGrocery(grocery);
    }
    // DELETE
    $scope.removeGrocery = function(grocery) {
        GroceryService.deleteGrocery(grocery).success(function(response){
            $scope.groceries.splice($scope.groceries.indexOf(grocery), 1);
        });
    };

    // Total Price
    $scope.totalPrice = function(){
        if($scope.groceries != null) {
            var totalPrice = 0;
            for(var count=0; count<$scope.groceries.length; count++) {
                totalPrice += $scope.groceries[count].price;
            }
            return totalPrice;
        }
    };

    $scope.search = function() {

    }
}]);

groceryApp.controller('GroceryItemEditCtrl', ['$scope', '$routeParams', 'GroceryService',
                             function($scope, $routeParams, GroceryService){
    $scope.itemId = $routeParams.itemId;
    GroceryService.getGrocery($scope.itemId).success(function(result){
        $scope.item = result.data;
    });

    $scope.update = function(item) {
        GroceryService.updateGrocery($scope.item).success(function(){
        });
    };
}]);

groceryApp.controller('AboutCtrl', ['$scope',function($scope){

}]);
