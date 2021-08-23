import { ViewComponent } from '../view.component.js';

RegisterComponent.prototype = new ViewComponent('register');
function RegisterComponent() {

    this.render = function() {
        RegisterComponent.prototype.injectStylesheet();
        RegisterComponent.prototype.injectTemplate(() => {
            console.log('RegisterComponent template loaded');
        });
    }

}

export default new RegisterComponent();