import $A from "../helper.js";

export default {
    /**
     * takes tag type, class name, id name and forms a simple dom element.
     * @param {str} tagName 
     * @param {str} className 
     * @param {str} idName 
     */
    makeDomElement: function (tagName, className = null, idName = null) {
        let dom = document.createElement(tagName);
        if ($A.generic.checkVariableType(dom) !== 'domelement') {
            throw Error(`DOM Error: Could not create dom element ${tagName}`);
        }
        if(className) {
            dom.classList.add(className);
        }
        if(idName) {
            dom.id = idName;
        }
        return dom;
    },

    /**
     * Returns a dom element from containerId, while snipping off
     * 'Response' from it's end.
     * @param {str} responseContainerId: dom element id value to use.
     */
    containerElement: function(responseContainerId) {
        const parentId = responseContainerId.replace(/Response$/,'');
        const container = document.getElementById(parentId);

        if ($A.generic.checkVariableType(container) !== 'domelement') {
            throw Error(`DOM Error: Dom element with id=${parentId} could not be found in containerElement().`);
        }

        return container;
    },

    obtainElementCorrectly: function(containerId) {
        if ($A.generic.checkVariableType(containerId) !== 'string') {
            throw Error(`DOM Error: Provided containerId not in string format: [ ${containerId} ] in obtainElementCorrectly()`);
        }

        const elem = document.getElementById(containerId);

        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            throw Error(`DOM Error: Dom element with id=${containerId} could not be found in obtainElementCorrectly().`);
        }

        return elem;
    },

    searchElementCorrectly: function(searchString, container = null) {
        if ($A.generic.checkVariableType(searchString) !== 'string') {
            throw Error(`DOM Error: Provided searchString not in string format: ${searchString}: searchElementCorrectly()`);
        }

        if (!container) {
            container = document;
        }

        const conType = $A.generic.checkVariableType(container);
        if (conType !== 'domelement' && conType !== 'document') {
            throw Error(`DOM Error: Dom container-element with id=${container.id} could not be found in searchElementCorrectly().`);
        }

        const elem = container.querySelector(searchString);

        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            throw Error(`DOM Error: Dom element query could not be found with: [ ${searchString} ] in searchElementCorrectly().`);
        }

        return elem;
    },

    searchAllElementsCorrectly: function(searchString, container = null, throwError = false) {
        if ($A.generic.checkVariableType(searchString) !== 'string') {
            throw Error(`DOM Error: Provided searchString not in string format: ${searchString}: searchAllElementsCorrectly()`);
        }

        if (!container) {
            container = document;
        }

        const conType = $A.generic.checkVariableType(container);
        if (conType !== 'domelement' && conType !== 'document') {
            throw Error(`DOM Error: Dom container-element with id=${container.id} could not be found in searchAllElementsCorrectly().`);
        }

        const elem = container.querySelectorAll(searchString);

        if ($A.generic.checkVariableType(elem) !== 'nodelist') {
            if (throwError) {
                throw Error(`DOM Error: Dom element query could not be found with: [ ${searchString} ] in searchAllElementsCorrectly().`);
            }
            return null;
        }

        return elem;
    },
};

