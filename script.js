// Code goes here
String.prototype.format = function () {
        var args = [].slice.call(arguments);
        return this.replace(/(\{\d+\})/g, function (a){
            return args[+(a.substr(1,a.length-2))||0];
        });
};

(function(){
  var app = angular.module("financeDashboard", ["gridster", "ui.bootstrap"]);
  
  app.directive('capitalize', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if(inputValue == undefined) inputValue = '';
           var capitalized = inputValue.toUpperCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
      }
    };
  });
  
  app.directive('search', function () {
    return function ($scope, element) {
      element.bind("keyup", function (event) {
        var val = element.val();
        if(val.length > 0) {
          $scope.search(val);
        }
      });
    };
  });
  
  app.filter('percentage', function() {
    return function(input) {
      if (isNaN(input)) {
        return input;
      }
      var output = parseFloat(input).toFixed(3);
      var plus = output > 0 ? "+" : "";
      return plus + output + "%";
    };
  });
  
  var MainController = function($scope, yahooStocks){
    $scope.message = "Hello Angular";
    $scope.stocks = {"^IXIC": {}, "^GSPC": {}};
    $scope.chartGranularity = 6;
    $scope.validStock = false;
    
    $scope.addNewStock = function(){
      $scope.stocks[$scope.newStockSymbol] = {};
      $scope.newStockSymbol = "";
      $scope.validStock = false;
      lookupStocks();
    };
    
    $scope.search = function(){
      yahooStocks.getStocks(formatStockQuery($scope.newStockSymbol), onStockLookupSuccess, onYahooStocksFailure);
    }
    
    $scope.gridsterOptions = {
			margins: [10, 10],
			columns: 4,
			draggable: {
				handle: 'h3'
			}
		};
    
    var onStockRetrievalSuccess = function(response){
      response.list.resources.forEach(function(stock){
        $scope.stocks[stock.resource.fields.symbol] = {
          symbol: stock.resource.fields.symbol,
          company: stock.resource.fields.name,
          price: stock.resource.fields.price,
          change: stock.resource.fields.change,
          changePercent: stock.resource.fields.chg_percent,
          changeClass: parseFloat(stock.resource.fields.change) > 0 ? "positiveChange" : "negativeChange",
          sizeY: 1,
          sizeX: 1
        };
      });
    };
    
    var onYahooStocksFailure = function(reason){
      console.log("Stock retrieval failed");
    };
    
    var onStockLookupSuccess = function(response){
      if(response.list.resources.length > 0){
        $scope.validStock = true;
      } else {
        $scope.validStock = false;
      }
    }
    
    var formatStockQuery = function(stockSymbolsString){
      return "http://finance.yahoo.com/webservice/v1/symbols/{0}/quote?format=json&view=detail&callback=JSON_CALLBACK".format(stockSymbolsString);
    }
    
    var lookupStocks = function(){
      var symbols = [];
      for(var stockSymbol in $scope.stocks){
        if(!$scope.stocks.hasOwnProperty(stockSymbol)) continue;
        symbols.push(stockSymbol);
      }
      var stockSymbolsString = symbols.join();
      yahooStocks.getStocks(formatStockQuery(stockSymbolsString), onStockRetrievalSuccess, onYahooStocksFailure);
    };

    lookupStocks();
  };
  
  var CustomWidgetController = function($scope, $uibModal){
    $scope.remove = function(widget) {
			delete $scope.stocks[widget];
		};
		
		$scope.openSettings = function(widget) {
		  $scope.currentWidget = widget;
			$uibModal.open({
				scope: $scope,
				templateUrl: 'widget_settings.html',
				controller: 'WidgetSettingsController'
			});
		};
  };
  
  var WidgetSettingsController = function($scope, $rootScope, $uibModalInstance){

    $scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			delete $scope.stocks[widget];
			$uibModalInstance.close();
		};
  };
  
  app.controller("MainController", ["$scope", "yahooStocks", MainController]);
  app.controller("CustomWidgetController", ["$scope","$uibModal", CustomWidgetController]);
  app.controller("WidgetSettingsController", ["$scope", "$rootScope", "$uibModalInstance", WidgetSettingsController]);
}());