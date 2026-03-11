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
        dom.className = className;
        dom.idName = idName;
        return dom;
    },

    /**
     * Async functions have to be defined in the modern JS ES6 format:
     */

    /**
     * Loads a component specified with arguments.
     * No use of this.* in arrow functions.
     * @param {str} component: name of specific component. Components in sub-folders should be denoted with a 'subfolder.compoenentName' notation.
     * @param {str} app: name of django app/module we are operating in 
     */
    load: async function (component, app) {
        const componentPath = component.replace(/\./, '/');
        try {
            // The import() function accepts the string variable
            const module = await import(`../../../${app}/js/components/${componentPath}.js`);
            return module.default;
        } catch (error) {
            console.error('Error loading component:', error);
        }
    },

    /**
     * Save key=>value  pair to localStorage
     * No use of this.* in arrow functions.
     * @param {*} key 
     * @param {*} value 
     */
    memSave: function (key, value) {
        if ($A.generic.isPrimitiveValue(value)) {
            localStorage.setItem(key, String(value));
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    /**
     * Fetch localStorage value with key.
     * No use of this.* in arrow functions.
     * @param {*} key 
     * @param {*} isJson 
     * @returns 
     */
    memFetch: function (key, isJson = false) {
        let strValue = localStorage.getItem(key);
        return isJson ? JSON.parse(strValue) : strValue;
    },

    /**
     * Returns a dom element from containerId, while snipping off
     * 'Response' from it's end.
     * @param {str} responseContainerId: dom element id value to use.
     */
    containerElement: function(responseContainerId) {
        const parentId = responseContainerId.replace(/Response$/,'');
        return document.getElementById(parentId);
    }
};

