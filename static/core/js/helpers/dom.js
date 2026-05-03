import $A from "../helper.js";

export default {
    /**
     * takes tag type, class name, id name and forms a simple dom element.
     * @param {str} tagName 
     * @param {str} className 
     * @param {str} idName 
     */
    makeDomElement: function (tagName, className = null, idName = null, innerHTML = '') {
        let dom = document.createElement(tagName);
        if ($A.base.not(dom, 'domelement')) {
            throw Error(`DOM Error: Could not create dom element ${tagName}`);
        }
        if(className) {
            dom.setAttribute('class', className);
        }
        if(idName) {
            dom.id = idName;
        }
        dom.innerHTML = innerHTML;
        return dom;
    },

    /**
     * Returns a dom element from containerId, while snipping off
     * 'Response' from it's end.
     * @param {str} responseContainerId: dom element id value to use.
     */
    containerElement: function(responseContainerId, parent = null) {
        const containerId = responseContainerId.replace(/Response$/,'');
        let container = null;

        if ($A.base.is(parent, 'domelement')) {
            container = parent.querySelector(`#${containerId}`);
        } else {
            container = document.getElementById(containerId);
        }

        if ($A.base.not(container, 'domelement')) {
            console.warn(`DOM Error: Dom element with id=${containerId} could not be found in DOM.`, responseContainerId, parent);
            throw Error(`DOM Error: Dom element with id=${containerId} could not be found in DOM.`);
        }

        return container;
    },

    /**
     * Attempts to find dom element with provided id
     * @param {str} containerId: dom element id attribute value without # prefix
     * @param {bool} throwError: default true
     * @returns 
     */
    obtainElementCorrectly: function(containerId, throwError = true) {
        if ($A.base.not(containerId, 'string')) {
            if (throwError) {
                throw Error(`DOM Error: Provided containerId not in string format: [ ${containerId} ] in obtainElementCorrectly()`);
            }
            return null;
        }

        const elem = document.getElementById(containerId);

        if ($A.base.not(elem, 'domelement')) {
            if (throwError) {
                throw Error(`DOM Error: Dom element with id=${containerId} could not be found in obtainElementCorrectly().`);
            }
            return null;
        }

        return elem;
    },

    searchElementCorrectly: function(searchString, container = null) {
        if ($A.base.not(searchString, 'string')) {
            throw Error(`DOM Error: Provided searchString not in string format: ${searchString}: searchElementCorrectly()`);
        }

        if (!container) {
            container = document;
        }

        const conType = $A.base.type(container);
        if (conType !== 'domelement' && conType !== 'document') {
            throw Error(`DOM Error: Dom container-element with id=${container.id} could not be found in searchElementCorrectly().`);
        }

        const elem = container.querySelector(searchString);

        if ($A.base.not(elem, 'domelement')) {
            throw Error(`DOM Error: Dom element query could not be found with: [ ${searchString} ] in searchElementCorrectly().`);
        }

        return elem;
    },

    searchAllElementsCorrectly: function(searchString, container = null, throwError = false) {
        if ($A.base.not(searchString, 'string')) {
            throw Error(`DOM Error: Provided searchString not in string format: ${searchString}: searchAllElementsCorrectly()`);
        }

        if (!container) {
            container = document;
        }

        const conType = $A.base.type(container);
        if (conType !== 'domelement' && conType !== 'document') {
            throw Error(`DOM Error: Dom container-element with id=${container.id} could not be found in searchAllElementsCorrectly().`);
        }

        const elem = container.querySelectorAll(searchString);

        if ($A.base.not(elem, 'nodelist')) {
            if (throwError) {
                throw Error(`DOM Error: Dom element query could not be found with: [ ${searchString} ] in searchAllElementsCorrectly().`);
            }
            return null;
        }

        return elem;
    },
};

