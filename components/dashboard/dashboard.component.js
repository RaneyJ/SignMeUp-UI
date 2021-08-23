import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;

    this.render = function() {

        console.log(state);

        if (!state.authUser) {
            router.navigate('/login');
            return;
        }

        let currentUsername = state.authUser.username;

        DashboardComponent.prototype.injectStylesheet();
        DashboardComponent.prototype.injectTemplate(() => {

            welcomeUserElement = document.getElementById('welcome-user');
            welcomeUserElement.innerText = currentUsername;

            window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

}

export default new DashboardComponent();
