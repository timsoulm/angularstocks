(function(){
  
  var yahooStocks = function($http){
    var getStocks = function(query, onStockRetrievalSuccess, onStockRetrievalFailure){
      $http.jsonp(query)
        .success(onStockRetrievalSuccess)
        .error(onStockRetrievalFailure);
    };
  
    return {
      getStocks: getStocks
    };
  
  };
  
  var module = angular.module("financeDashboard");
  module.factory("yahooStocks", yahooStocks);
}());