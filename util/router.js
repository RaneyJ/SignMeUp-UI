export function Router(routes) {

    this.navigate = function(routePath) {
        let nextRoute = routes.filter(route => route.path === routePath).pop();
        if (nextRoute) {
            nextRoute.component.render();
        } else {
            console.error(`No component found for route: ${routePath}`)
        }
    }

}
