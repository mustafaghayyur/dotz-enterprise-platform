import $A from "./helper.js";

/**
 * App allows for a centeral container for each 'module' of the 
 * Dotz Enterprise Platform.
 */
export function Main(callbackFunction) {
    try {
        document.addEventListener('DOMContentLoaded', () => {
            $A.fetch.body($A.fetch.route('api.settings'), 'authenticationResponse', {}, 
                async (data, containerId) => {
                    $A.generic.loopObject(data, (key, val) => {
                        $A.app.memSave(key, data[key]); // @todo: confirm this loop is saving data from api
                        return null;
                    });

                    runAuthSetupOperations(data, containerId);

                    if (typeof callbackFunction === 'function') {
                        callbackFunction();
                    }
                    $A.state.events.initializeAllComponents();
                    return null;
                }
            );
            $A.app.runBasicSetupOperations();
        });
    } catch (error) {
        let container = document.getElementById('appErrorResponse');
        container.classList.remove('d-none');
        container.innerHTML = '<div class="alert alert-danger">' + String(error) + '<br>' + error.message + '</div>';
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
        }

        let loginBox = $A.dom.obtainElementCorrectly('authBox');
        const user = $A.app.memFetch('user', true);
        let authenticatedNav = $A.dom.searchElementCorrectly('.is_authenticated', loginBox);
        let anonymousNav = $A.dom.searchElementCorrectly('.anonymous_user', loginBox);

        if (user && user.is_authenticated === true) {
            $A.ui.embedData(user, authenticatedNav, true);
            authenticatedNav.classList.remove('d-none');
            anonymousNav.classList.add('d-none');
        } else {
            authenticatedNav.classList.add('d-none');
            anonymousNav.classList.remove('d-none');
        }
    }
}
