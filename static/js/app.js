var groceryApp = angular.module('groceryApp', ['ngResource', 'ngRoute', 'ngAnimate']);

groceryApp.config(['$routeProvider',function($routeProvider){
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

groceryApp.directive('animateOnChange', ['$timeout', function($timeout){
    return function(scope, element, attr) {
        scope.$watch(attr.animateOnChange, function(nv, ov){
            if (nv!=ov) {
                element.addClass('changed');
                $timeout(function() {
                    element.removeClass('changed');
                }, 1000);
            }
        });
    }
}]);



groceryApp.factory('GroceryService', ['$http', function($http){
    var urlBase = '/api/groceries';
    var dataFactory = {};
    dataFactory.getGroceries = function() {
        return $http.get(urlBase);
    };

    dataFactory.getGrocery = function(id) {
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
    $scope.filteredGroceries = {}
    // GET
    getGroceries();
    function getGroceries() {
        GroceryService.getGroceries().success(function(result){
            $scope.groceries = result.data;
        });
    }
    $scope.refresh = function() {
        $scope.groceries = {};
        getGroceries();
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

    $scope.totalFilteredPrice = function() {
        if(!$scope.filtered || $scope.filteredGroceries === undefined) {
            return;
        }
        var sum = 0;
        angular.forEach($scope.filteredGroceries,function(item){
            sum +=item.price;
        })
        return sum;
    };
    $scope.filtered = function() {
        if($scope.searchByName === undefined && $scope.searchByPlace === undefined && $scope.searchByDate === undefined) {
            return false;
        }
        filterLength = getLengthIfExists([$scope.searchByName, $scope.searchByPlace, $scope.searchByDate]);
        if(filterLength > 0) {
            return true;
        } else {
            return false;
        }
    }
    function getLengthIfExists(checkStrings) {
        var length = 0;
        for (var i = checkStrings.length - 1; i >= 0; i--) {
            if(checkStrings[i] !== undefined) {
                length += checkStrings[i].length;
            }
        };
        return length;
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

groceryApp.controller('GroceryItemAddCtrl', ['$scope', 'GroceryService',
                             function($scope, GroceryService){
    $scope.item = {};
    $scope.add = function () {
        var item = $scope.item;
        GroceryService.addGrocery(item).success(function(){
        });
    };
}]);


groceryApp.controller('AboutCtrl', ['$scope',function($scope){

}]);
