var groceryApp = angular.module('groceryApp', ['ngResource']);

groceryApp.controller('GroceryListCtrl', ['$scope', '$http', function($scope, $http){
    $scope.myWord = "Hello GroceryTracker";

    $scope.newGrocery = {};
    // GET
    $http.get('/api/groceries').success(function(result) {
        $scope.groceries = result.data;
    });
    // POST
    $scope.addGrocery = function(){
        console.log("Start Add Grocery");
        console.log($scope.newGrocery);
        $http.post('/api/groceries', $scope.newGrocery).success(function(data){
            $scope.groceries.push(data);
        });
        $scope.newGrocery = {};
    }
    // PUT
    $scope.updateGrocery = function(grocery){
        $http.put('/api/grocery/' + grocery.id, grocery);
    }
    // DELETE
    $scope.removeGrocery = function(grocery) {
        $http.delete('/api/grocery/' + grocery.id).success(function(response){
            $scope.groceries.splice($scope.groceries.indexOf(grocery), 1);
        });
    };
}]);
