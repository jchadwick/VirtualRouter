
angular.module('ComponentRouting', [])
    .controller('DemoCtrlr', function ($scope) {

        $scope.someValue = 'w00t!';

        $scope.views = {
            'view1': { $template: '<h3>VIEW 1!</h3>' },
            'view2': { $template: '<p>This is the second view.</p><p>By the way, $scope.someValue = {{someValue}}</p>' },
        };
        
        $scope.setView = function (viewName) {
            $scope.__mlRoute = { locals: $scope.views[viewName] };
        };

        $scope.setView('view1');
        
    })
