import $A from "../helper.js";

/**
 * @todo: show failiure message for not-found requests
 * @todo: add support for tabs and off-canvas modals
 * @todo: support multi-paramed requests...
 * Allows us to request a modal for matched url paam-key.
 * Only IDs of database records are assumed as keys.
 * @param {str} keyToFetch: key you are requesting
 * @param {str} routeToCall: Fetcher() approved route to retrieve data from.
 * @param {str} modalId: 'modalId' we should show if true
 * @param {function} callbackFunction: has to be a callable function that deals with Fetcher's results
 */
export function showModal(keyToFetch, routeToCall, modalId, callbackFunction) {
    let idToFetch = $A.app.getQueryParam(keyToFetch);
    const responseContainer = document.getElementById(modalId + 'Response');
    
    if ($A.generic.checkVariableType(idToFetch) === 'number') {
        idToFetch = parseInt(idToFetch);
    } else {
        if (responseContainer instanceof HTMLElement) {
            responseContainer.textContent = 'Id: ' + idToFetch + ' could not be read, record could not be fetched.';
        }
        return null;
    }

    const request = defineRequest(routeToCall, idToFetch);
    Fetcher(request, responseContainer, {}, (response) => {
        // Select the modalId element using its ID and show it
        const modalEl = document.getElementById(modalId);
        if (modalEl) {
            const modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.show();
        }
        
        // callback to populate modal with fetched response.results
        callbackFunction(response, modalId); // all callbackFunctions would have to take these two params
    });
}

/**
 * Adds or updates a URL parameter in the browser's address bar without reloading the page.
 * 
 * @param {string} key The parameter name.
 * @param {string} value The parameter value.
 * @param {boolean} [addToHistory=true] Whether to add a new entry to the browser history (pushState) or replace the current one (replaceState).
 */
export function updateUrlParam(key, value, addToHistory = true) {
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