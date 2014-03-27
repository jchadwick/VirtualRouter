
angular.module('VirtualRouting', ['ng'])

    .controller('MainController', function ($scope, virtualRouter, $location) {

        var router = virtualRouter($scope)
            .when('/view1', { template: '<h3>View 1</h3><p>Path: {{path}}</p>' })
            .when('/view2', { templateUrl: '/views/Main/View2.html' })
            .when('/view3', { templateUrl: '/views/Main/View3.html' })
            .otherwise({ redirectTo: '/view1' })
            .watch('path');

        $scope.router = router;

        $scope.message = 'Hey, it works!!';

        router.navigateTo('/view3');

        $scope.$on('$locationChangeSuccess', function () {
            router.navigateTo($location.path());
        });

    })

    .controller('ClientsController', function ($scope, virtualRouter) {

        virtualRouter($scope)
            .when('/home', { templateUrl: '/views/Clients/Home.html' })
            
            // Parameterized route:
            .when('/clients/:clientId', {
                templateUrl: '/views/Clients/Details.html',
                controller: function ($scope, $routeParams) {
                    angular.extend($scope, $routeParams);
                }
            })
            .otherwise({ redirectTo: '/home' })
            .watch('path');
    })

