import $A from "./helper.js";

/**
 * App allows for a centeral container for each 'app' of the 
 * Dotz Enterprise Platform.
 */
export function Main(callbackFunction) {
    try {
        document.addEventListener('DOMContentLoaded', () => {
            const request = $A.fetch.route('api.settings');
            $A.fetch.body(request, 'authenticationResponse', {}, (data, containerId) => {
                $A.generic.loopObject(data, (key, val) => {
                    $A.app.memSave(key, data[key]); // @todo: confirm this loop is saving data from api
                    return null;
                });

                const loginRequired = document.getElementById('loginRequired');
                $A.app.memSave('loginRequired', loginRequired.dataset.loginRequired);
                
                const isAuth = data.user ? data.user.is_authenticated : false;
                if (!isAuth && loginRequired.dataset.loginRequired === 'true') {
                    relocateToLogin();
                }

                if (loginRequired.dataset.loggedOut === 'true') {
                    $A.app.memSave('user', null);
                    console.log('Logging out user...', $A.app.memFetch('user', true));
                }

                if (typeof callbackFunction === 'function') {
                    return callbackFunction();
                }
            });

            runBasicSetup();
        });
    } catch (error) {
        let container = document.getElementById('appErrorResponse');
        container.classList.remove('d-none');
        container.innerHTML = '<div class="alert alert-danger">' + String(error) + '<br>' + error.message + '</div>';
    }

    /**
     * Add any init operations you wish implemented software-wide, 
     * to this function.
     */
    function runBasicSetup() {
        // initialize tooltips for entire software:
        $A.app.initializeTooltips();
        $A.app.initializePopovers();
        fixForms();

        let loginBox = $A.dom.obtainElementCorrectly('authBox');
        const user = $A.app.memFetch('user', true);
        let authenticatedNav = $A.dom.searchElementCorrectly('.is_authenticated', loginBox);
        let anonymousNav = $A.dom.searchElementCorrectly('.anonymous_user', loginBox);

        if (user && user.is_authenticated === true) {
            console.log('confirming user obj', user);
            $A.ui.embedData(user, authenticatedNav, true);
            authenticatedNav.classList.remove('d-none');
            anonymousNav.classList.add('d-none');
        } else {
            authenticatedNav.classList.add('d-none');
            anonymousNav.classList.remove('d-none');
        }


        /*
        Modal close cleanup operations can be defined below...
        let modals = document.querySelectorAll('.modal');
        modals.forEach((modal) => {
            if ($A.generic.checkVariableType(modal) !== 'domelement') {
                throw Error('DOM Error: could not fetch Modal dom element with value: ' + modal);
            }
            modal.addEventListener('hidden.bs.modal', function (event) {});
        });*/
    }

    /**
     * Fix operations on forms - globally.
     */
    function fixForms() {
        // configure django forms upon init:
        const forms = $A.dom.searchAllElementsCorrectly('form');
        if (forms) {
            forms.forEach((form) => {
                // radio-btn classes need to be fixed:
                let radios = $A.dom.searchAllElementsCorrectly('div.form-check.form-check-inline input[type="radio"]', form);
                if (radios) {
                    radios.forEach((radio) => {
                        radio.classList.remove('form-check');
                        radio.classList.remove('form-check-inline');
                        radio.classList.add('form-check-input');
                    });
                }
            });
        }
    }


    function relocateToLogin() {
        let urls = $A.app.memFetch('allowed_routes', true);
        window.location.href = urls.ui.auth.login;
    }
}
