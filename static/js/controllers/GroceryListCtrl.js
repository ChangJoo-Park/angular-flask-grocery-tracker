groceryApp.controller('GroceryListCtrl', ['$scope', '$http', 'GroceryService',
    function($scope, $http, GroceryService) {
        $scope.myWord = "Hello GroceryTracker";
        $scope.newGrocery = {};
        $scope.filteredGroceries = {};
        $scope.searchByName = '';
        $scope.searchByPlace = '';
        $scope.searchByDate = '';

        $('#searchByName').select2({
            placeholder: "Search By Name",
            allowClear: true
        }).change(function() {
            data = $("#searchByName").select2("data")[0];
            if (data === undefined) {
                $scope.$apply(function() {
                    $scope.searchByName = '';
                });
                return;
            }
            data = data.text.trim();
            $scope.$apply(function() {
                $scope.searchByName = data;
            });
        });
        $('#searchByPlace').select2({
            placeholder: "Search By Place",
            allowClear: true
        }).change(function() {
            data = $("#searchByPlace").select2("data")[0];
            if (data === undefined) {
                $scope.$apply(function() {
                    $scope.searchByPlace = '';
                });
                return;
            }
            data = data.text.trim();
            $scope.$apply(function() {
                $scope.searchByPlace = data;
            });
        });
        $("#datepicker").datepicker({
            format: "yyyy-mm-dd",
            weekStart: 1,
            autoclose: true,
            todayHighlight: true,
            clearBtn: true
        }).on('changeDate', function(e) {
            $scope.$apply(function() {
                if (e.dates.length === 0) {
                    $scope.searchByDate = '';
                } else {
                    $scope.searchByDate = moment(e.date).format("YYYY-MM-DD");
                }
            });
        });

        // GET
        getGroceries();

        function getGroceries() {
            GroceryService.getGroceries().success(function(result) {
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
            GroceryService.addGrocery(data).success(function() {
                getGroceries();
            });
            data = {};
        }
        $scope.addGrocery = function() {
            addGrocery();
            $scope.newGrocery = {};
        }

        // PUT
        $scope.updateGrocery = function(grocery) {
                GroceryService.updateGrocery(grocery);
            }
            // DELETE
        $scope.removeGrocery = function(grocery) {
            GroceryService.deleteGrocery(grocery).success(function(response) {
                $scope.groceries.splice($scope.groceries.indexOf(grocery), 1);
            });
        };

        // Total Price
        $scope.totalPrice = function() {
            if ($scope.groceries != null) {
                var totalPrice = 0;
                for (var count = 0; count < $scope.groceries.length; count++) {
                    totalPrice += $scope.groceries[count].price;
                }
                return totalPrice;
            }
        };

        $scope.totalFilteredPrice = function() {
            if (!$scope.filtered || $scope.filteredGroceries === undefined) {
                return;
            }
            var sum = 0;
            angular.forEach($scope.filteredGroceries, function(item) {
                sum += item.price;
            })
            return sum;
        };

        $scope.filtered = function() {
            if ($scope.searchByName === undefined && $scope.searchByPlace === undefined && $scope.searchByDate === undefined) {
                return false;
            }
            filterLength = getLengthIfExists([$scope.searchByName, $scope.searchByPlace, $scope.searchByDate]);
            if (filterLength > 0) {
                return true;
            } else {
                return false;
            }
        }

        function getLengthIfExists(checkStrings) {
            var length = 0;
            for (var i = checkStrings.length - 1; i >= 0; i--) {
                if (checkStrings[i] !== undefined) {
                    length += checkStrings[i].length;
                }
            };
            return length;
        }

    }
]);
