// This is WIP.

import generic from "../helpers/generic.js";
import app from "../helpers/app.js";
import { Fetcher, defineRequest } from "./async.js";

/**
 * Routes Module
 * Allows showing of modals|tabs|offCanvas elements for matched url param-key.
 * Only Id columns of database tables are assumed as keys.
 */
export default function () {
    let key = null;
    let idToFetch = null;
    const modal = null;
    const responseContainer = null;
    let errors = [];

    const kernel = {
        /**
         * Internal function.
         * Cleans internal memeory after every use.
         */
        cleanMemory: () => {
            key = null;
            idToFetch = null;
            modal = null;
            responseContainer = null;
            errors = [];
        },

        /**
         * What URL GET paramerter key should we be looking for in this route?
         * @param {str} keyToFetch: key you are requesting
         */
        lookFor: (keyToFetch) => {
            key = keyToFetch;
            idToFetch = getQueryParam(keyToFetch);
            if (generic.type(idToFetch) === 'number') {
                idToFetch = parseInt(idToFetch);
            } else {
                errors.push = `The ${key} you are looking for does not exist.`;
            }

            return kernel;
        },

        /**
         * @param {str} modalId: 'modalId' we should show if true
         */
        openPane: (modalId, type = 'modal') => {
            modal = document.getElementById(modalId);
            responseContainer = document.getElementById(modalId + 'Response');

            if (generic.type(modal) !== 'domelement') {
                errors.push = 'Modal not defined. Cannot show route.';
                return kernel;
            }

            if (type === 'modal') {
                showModal(modal);
                return kernel;
            }

            if (type === 'tab') {
                showTab(modal);
                return kernel;
            }

            if (type === 'canvas') {
                showCanvas(modal);
                return kernel;
            }
            return kernel;
        },

        /**
         * Final call in chain: where should the opened Pane retrieve its content from?
         * @param {*} route: Fetcher() acceptable route
         * @param {function} callbackFunction: has to be a callable function that deals with Fetcher's results
         */
        routeWhere: (route, callbackFunction) => {
            if (generic.type(route) !== 'string') {
                errors.push('Api ruote key not in string format: "interface.app.node".');
            }

            if (generic.type(responseContainer) !== 'domelement') {
                errors.push = 'Response Container does not exist. Errors cannot be shown.';
                kernel.showErrors('console');  // display any errors found before attempting Fetcher().
            } else {
                kernel.showErrors('default');  // display any errors found before attempting Fetcher().
            }
            
            const request = defineRequest(route, idToFetch);
            Fetcher(request, modal.id + 'Response', {}, callbackFunction);

            kernel.cleanMemory();
        },

        /**
         * Internal function.
         * This call is automatically made.
         */
        showErrors: (where = 'default') => {
            if (where === 'default') {
                let div = null;
                errors.forEach(error, () => {
                    div = app.makeDomElement('div', 'small');
                    div.textContent = error;
                    responseContainer.appendChild(div);
                });
            } else {
                errors.forEach(error, () => {
                    div = app.makeDomElement('div', 'small');
                    console.log('Error in Router: ', error);
                });
            }
        },

        /**
         * Updates URL parameter in the browser's address bar without reloading the page.
         * 
         * @param {string} key The parameter name.
         * @param {string} value The parameter value.
         * @param {boolean} [addToHistory=true] Whether to add a new entry to the browser history (pushState) or replace the current one (replaceState).
         */
        updateAddressBar: (key, value, addToHistory = true) => {
            // Create a URL object from the current window location
            const url = new URL(window.location.href);

            // Use URLSearchParams.set() to add or update the parameter
            url.searchParams.set(key, value);

            // Determine which history method to use
            if (addToHistory) {
                // pushState adds a new entry to the history, allowing the back button to work
                window.history.pushState({}, '', url.href);
            } else {
                // replaceState modifies the current history entry, preventing a new history entry
                window.history.replaceState({}, '', url.href);
            }
        }
    }

    function showModal(modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();  
    }

    function showCanvas(canvas) {
        const offCanvas = new bootstrap.Offcanvas(canvas);
        offCanvas.show();
    }

    function showTab(tab) {
        let name = tab.dataset.tabName;
        let pane = document.getElementById('tab-' + name);
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        pane.classList.add('active');
    }

    /**
     * Internal function
     * Returns requested param's value if set in url params.
     * @param {str} paramStr: whic key are you requesting?
     */
    function getQueryParam(paramStr) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramStr);
    }

    //return the kernal...
    return kernel;
}


/**
 * @todo: show failiure message for not-found requests
 * @todo: support multi-paramed requests...
*/