groceryApp.controller('GroceryItemAddCtrl', ['$scope', 'GroceryService', '$location',
    function($scope, GroceryService, $location) {
        $scope.item = {};
        $scope.add = function() {
            var item = $scope.item;
            GroceryService.addGrocery(item).success(function() {
                $location.path('#/');
            });
        };
    }
]);
