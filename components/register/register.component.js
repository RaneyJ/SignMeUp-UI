import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

RegisterComponent.prototype = new ViewComponent('register');
function RegisterComponent() {

    let usernameFieldElement;
    let passwordFieldElement;
    let emailFieldElement;
    let firstNameFieldElement;
    let lastNameFieldElement;
    let isFacultyFieldElement;

    let registerButtonElement;
    let errorMessageElement;

    let username = '';
    let password = '';
    let email = '';
    let firstName = '';
    let lastName = '';
    let isfaculty = false;

    function updateUsername(e) {
        username = e.target.value;
        console.log(username);
    }

    function updatePassword(e) {
        password = e.target.value;
        console.log(password);
    }

    function updateEmail(e) {
        email = e.target.value;
        console.log(email)
    }

    function updateFirstName(e) {
        firstName = e.target.value;
        console.log(firstName);
    }

    function updateLastName(e) {
        lastName = e.target.value;
        console.log(lastName);
    }

    function updateIsFaculty(e) {
        isfaculty = e.target.checked;
    }

    function updateErrorMessage(errorMessage) {
        if (errorMessage) {
            errorMessageElement.removeAttribute('hidden');
            errorMessageElement.innerText = errorMessage;
        } else {
            errorMessageElement.setAttribute('hidden', 'true');
            errorMessageElement.innerText = '';
        }
    }

    async function register() {
        if (!username || !password || !email || !firstName || !lastName) {
            console.log(username, password, email, firstName, lastName);
            updateErrorMessage('You need fill out all fields!');
            return;
        } else {
            updateErrorMessage('');
        }

        let req = {
            username: username,
            password: password,
            email: email,
            firstName: firstName,
            lastName: lastName,
            isFaculty: isfaculty
        };

        console.log("requesting");

        try{

            let response = await fetch(`${env.apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req)
            })
            let data = await response.json();
            if(response.status === 401 || response.status === 400) {
                updateErrorMessage(data.message);
            }else{
                //Might need to make POST return the JWT
                state.authUser = data;
                state.JWT = response.headers.get("Authorization");
                console.log(state);
                router.navigate('/dashboard');
            }

        } catch(err){
            console.error(err.message);
        }
    }


    this.render = function() {
        RegisterComponent.prototype.injectStylesheet();
        RegisterComponent.prototype.injectTemplate(() => {
            usernameFieldElement = document.getElementById('register-form-username');
            passwordFieldElement = document.getElementById('register-form-password');
            emailFieldElement = document.getElementById('register-form-email');
            firstNameFieldElement = document.getElementById('register-form-first-name');
            lastNameFieldElement = document.getElementById('register-form-last-name');
            isFacultyFieldElement = document.getElementById('register-form-is-faculty');

            registerButtonElement = document.getElementById('register-form-button');;
            errorMessageElement = document.getElementById('error-msg');

            usernameFieldElement.addEventListener('keyup', updateUsername);
            passwordFieldElement.addEventListener('keyup', updatePassword);
            emailFieldElement.addEventListener('keyup', updateEmail);
            firstNameFieldElement.addEventListener('keyup', updateFirstName);
            lastNameFieldElement.addEventListener('keyup', updateLastName);
            isFacultyFieldElement.addEventListener('change', updateIsFaculty);
            registerButtonElement.addEventListener('click', register);

            isFaculty = false;
            window.history.pushState('register', 'Register', '/register');
        });
    }

}

export default new RegisterComponent();