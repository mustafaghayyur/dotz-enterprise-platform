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

            runBasicSetup();
        });
    } catch (error) {
        let container = document.getElementById('appErrorResponse');
        container.classList.remove('d-none');
        container.innerHTML = '<div class="alert alert-danger">' + String(error) + '<br>' + error.message + '</div>';
    }
}

/**
 * Add any init operations you wish implemented software-wide, to this function.
 */
function runBasicSetup() {
    // initialize tooltips for entire software:
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        delay: { show: 300, hide: 300 } // 300ms show delay, 7 second hide delay
    }));

    // initialize popovers for entire software:
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl, {
        delay: { show: 300, hide: 300 } // 300ms show and hide delay
    }));

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


function relocateToLogin() {
    let urls = $A.app.memFetch('allowed_routes', true);
    window.location.href = urls.ui.auth.login;
}