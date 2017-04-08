app.factory('photos', ['$http', function($http) {
  return $http.get('js/json/data.json')
         .success(function(data) {
           return data;
         })
         .error(function(data) {
           return data;
         });
}]);