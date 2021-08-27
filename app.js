import navbarComponent from './components/navbar/navbar.component.js';
import loginComponent from './components/login/login.component.js';
import registerComponent from './components/register/register.component.js';
import dashboardComponent from './components/dashboard/dashboard.component.js';
import discoverComponent from './components/discover/discover.component.js';

import { Router } from "./util/router.js";

//-----------------------------------------------------------------------------------

let routes = [

    {
        path: '/login',
        component: loginComponent
    },
    {
        path: '/register',
        component: registerComponent
    },
    {
        path: '/dashboard',
        component: dashboardComponent
    },
    {
        path: '/discover',
        component: discoverComponent
    }

];

const router = new Router(routes);

window.onload = () => {
    navbarComponent.render();
    router.navigate('/register');
}

export default router;