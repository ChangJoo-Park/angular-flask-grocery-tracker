groceryApp.factory('GroceryService', ['$http', function($http) {
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
