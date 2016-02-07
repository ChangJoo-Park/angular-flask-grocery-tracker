groceryApp.controller('GroceryItemEditCtrl', ['$scope', '$routeParams', 'GroceryService', '$location',
    function($scope, $routeParams, GroceryService, $location) {
        $scope.itemId = $routeParams.itemId;
        GroceryService.getGrocery($scope.itemId).success(function(result) {
            $scope.item = result.data;
        });

        $scope.update = function(item) {
            GroceryService.updateGrocery($scope.item).success(function() {
                $location.path('#/');
            });
        };
    }
]);
