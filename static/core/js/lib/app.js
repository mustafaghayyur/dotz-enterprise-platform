import $A from "../helper.js";

/**
 * The APP Module/Library allows for a centeral container for eeach 'app'/core of the 
 * Dotz CRM + PM Software.
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
                
                if (!data.is_authenticated && loginRequired.dataset.loginRequired === 'true') {
                    relocateToLogin();
                }

                if (typeof callbackFunction === 'function') {
                    return callbackFunction();
                }
            });

            /*let modals = document.querySelectorAll('.modal');
            modals.forEach((modal) => {
                if ($A.generic.checkVariableType(modal) !== 'domelement') {
                    throw Error('DOM Error: could not fetch Modal dom element with value: ' + modal);
                }
                modal.addEventListener('hidden.bs.modal', function (event) {});
            });*/
        });

        function relocateToLogin() {
            let urls = $A.app.memFetch('allowed_routes', true);
            window.location.href = urls.ui.auth.login;
        }
    } catch (error) {
        let container = document.getElementById('appErrorResponse');
        container.classList.remove('d-none');
        container.innerHTML = '<div class="alert alert-danger">' + String(error) + '<br>' + error.message + '</div>';
    }
}