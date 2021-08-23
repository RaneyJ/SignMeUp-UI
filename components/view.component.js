import env from '../util/env.js'

export function ViewComponent(viewName) {

    let templateHolder = '';
    let frag = `components/${viewName}/${viewName}.component`;

    this.viewMetadata = {
        name: viewName,
        url: `/${viewName}`,
        templateUri: `${frag}.html`,
        stylesheetUri: `${frag}.css`,
    };

    this.injectTemplate = function (cb) {
        if (templateHolder) {
            console.log(`Already fetch ${viewName} template, using internally store templateHolder.`);
            env.rootDiv.innerHTML = templateHolder;
            cb();
        } else {
            console.log(`First time fetching ${viewName} template!`)
            fetch(this.viewMetadata.templateUri)
                .then(resp => resp.text())
                .then(html => {
                    templateHolder = html;
                    env.rootDiv.innerHTML = templateHolder;
                    cb();
                })
                .catch(err => console.error(err));
        }
    }

    this.injectStylesheet = function() {
        let stylesheet = document.getElementById('dynamic-css');
        if (stylesheet) stylesheet.remove();
        stylesheet = document.createElement('link');
        stylesheet.id = 'dynamic-css'
        stylesheet.rel = 'stylesheet';
        stylesheet.href = this.viewMetadata.stylesheetUri;
        document.head.appendChild(stylesheet);
    }

}