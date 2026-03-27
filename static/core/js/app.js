import $A from "./helper.js";

/**
 * App allows for a centeral container for each 'module' of the 
 * Dotz Enterprise Platform.
 */
export function Main(callbackFunction) {
    try {
        document.addEventListener('DOMContentLoaded', () => {
            $A.fetch.body($A.fetch.route('api.settings'), 'authenticationResponse', {}, 
                (data, containerId) => {
                    $A.generic.loopObject(data, (key, val) => {
                        $A.app.memSave(key, data[key]); // @todo: confirm this loop is saving data from api
                        return null;
                    });

                    runAuthSetupOperations(data, containerId);

                    if (typeof callbackFunction === 'function') {
                        return callbackFunction();
                    }
                }
            );
            runBasicSetupOperations();
        });
    } catch (error) {
        let container = document.getElementById('appErrorResponse');
        container.classList.remove('d-none');
        container.innerHTML = '<div class="alert alert-danger">' + String(error) + '<br>' + error.message + '</div>';
    }


    /**
     * Add init operations to be implemented software-wide, 
     * here. Unauthenticated interfaces run this block as well.
     */
    function runBasicSetupOperations() {
        // initialize tooltips for entire software:
        $A.app.initializeTooltips();
        $A.app.initializePopovers();
        fixForms();

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
     * Operations here have user authentication status & 
     * info avaialble in this block.
     */
    function runAuthSetupOperations(data, containerId) {
        const loginRequired = document.getElementById('loginRequired');
        $A.app.memSave('loginRequired', loginRequired.dataset.loginRequired);
        
        const isAuth = data.user ? data.user.is_authenticated : false;
        if (!isAuth && loginRequired.dataset.loginRequired === 'true') {
            $A.app.relocateToLogin();
        }

        if (loginRequired.dataset.loggedOut === 'true') {
            $A.app.memSave('user', null);
            $A.app.memSave('allowed_routes', data.allowed_routes);  // update for anonymous users...
            console.log('Logging out user...', $A.app.memFetch('user', true), $A.app.memFetch('allowed_routes', true));
        }

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
            console.log('Auth user could not be identified.', user);
            authenticatedNav.classList.add('d-none');
            anonymousNav.classList.remove('d-none');
        }
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

    
}
