import router from "../../app.js";

const NAVBAR_ELEMENT = document.getElementById('navbar');

function NavbarComponent() {

    let templateHolder = '';
    let frag = 'components/navbar/navbar.component';

    function injectTemplate(callback) {

        if (templateHolder) {
            NAVBAR_ELEMENT.innerHTML = templateHolder;
        } else {
            fetch(`${frag}.html`)
                .then(resp => resp.text())
                .then(html => {
                    templateHolder = html;
                    NAVBAR_ELEMENT.innerHTML = templateHolder;
                    callback();
                })
                .catch(err => console.error(err));
        }
    }

    function injectStylesheet() {
        let dynamicStyle = document.getElementById('nav-css');
        if (dynamicStyle) dynamicStyle.remove();
        dynamicStyle = document.createElement('link');
        dynamicStyle.id = 'nav-css';
        dynamicStyle.rel = 'stylesheet';
        dynamicStyle.href = `${frag}.css`;
        document.head.appendChild(dynamicStyle);
    }

    function navigateToView(e) {
        router.navigate(e.target.dataset.route);
    }

    function logout() {
        console.log('Logging you out!');
    }

    this.render = function() {
        injectStylesheet();
        injectTemplate(() => {
            document.getElementById('logout').addEventListener('click', logout);
            document.getElementById('nav-to-login').addEventListener('click', navigateToView);
            document.getElementById('nav-to-register').addEventListener('click', navigateToView);
            document.getElementById('nav-to-dashboard').addEventListener('click', navigateToView);
        });
    }

}

export default new NavbarComponent();