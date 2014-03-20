﻿'use strict';

angular.module('ComponentRouting').directive('mlView', mlViewFactory);
angular.module('ComponentRouting').directive('mlView', mlViewFillContentFactory);


mlViewFactory.$inject = ['$anchorScroll', '$animate'];
function mlViewFactory($anchorScroll, $animate) {
    return {
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        link: function (scope, $element, attr, ctrl, $transclude) {
            var currentScope,
                currentElement,
                previousElement,
                autoScrollExp = attr.autoscroll,
                onloadExp = attr.onload || '';
            
            scope.$watch('__mlRoute', update);
            update();

            function cleanupLastView() {
                if (previousElement) {
                    previousElement.remove();
                    previousElement = null;
                }
                if (currentScope) {
                    currentScope.$destroy();
                    currentScope = null;
                }
                if (currentElement) {
                    $animate.leave(currentElement, function () {
                        previousElement = null;
                    });
                    previousElement = currentElement;
                    currentElement = null;
                }
            }

            function update() {
                if (!angular.isDefined(scope.__mlRoute))
                    return;

                var locals = scope.__mlRoute && scope.__mlRoute.locals,
                    template = locals && locals.$template;

                if (angular.isDefined(template)) {
                    var newScope = scope.$new();
                    var current = scope.__mlRoute;

                    // Note: This will also link all children of ng-view that were contained in the original
                    // html. If that content contains controllers, ... they could pollute/change the scope.
                    // However, using ng-view on an element with additional content does not make sense...
                    // Note: We can't remove them in the cloneAttchFn of $transclude as that
                    // function is called before linking the content, which would apply child
                    // directives to non existing elements.
                    var clone = $transclude(newScope, function (clone) {
                        $animate.enter(clone, null, currentElement || $element, function onNgViewEnter() {
                            if (angular.isDefined(autoScrollExp)
                              && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                $anchorScroll();
                            }
                        });
                        cleanupLastView();
                    });

                    currentElement = clone;
                    currentScope = current.scope = newScope;
                    currentScope.$emit('$viewContentLoaded');
                    currentScope.$eval(onloadExp);
                } else {
                    cleanupLastView();
                }
            }
        }
    };
}

// This directive is called during the $transclude call of the first `mlView` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as mlView
// is called.
mlViewFillContentFactory.$inject = ['$compile', '$controller'];
function mlViewFillContentFactory($compile, $controller) {
    return {
        restrict: 'ECA',
        priority: -400,
        link: function (scope, $element) {
            var current = scope.__mlRoute,
                locals = current.locals;

            $element.html(locals.$template);

            var link = $compile($element.contents());

            if (current.controller) {
                locals.$scope = scope;
                var controller = $controller(current.controller, locals);
                if (current.controllerAs) {
                    scope[current.controllerAs] = controller;
                }
                $element.data('$ngControllerController', controller);
                $element.children().data('$ngControllerController', controller);
            }

            link(scope);
        }
    };
}