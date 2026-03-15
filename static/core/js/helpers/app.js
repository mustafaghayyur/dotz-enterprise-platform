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
    },

    /**
     * Embeds provided API data into matching .embed.{key} nodes of containerId.
     * Does NOT create new nodes.
     * 
     * @param {*} data: api data reultset
     * @param {str} container: dom HTML element id (without the '#' prefix). Or actual node instance with 'actualNode' flag set to true
     * @param {bool} actualNode: true if actual DOM node is being passed in container.
     */
    embedData: function(data, container, actualNode = false) {
        const typeData = $A.generic.checkVariableType(data);
        if (typeData !== 'list' && typeData !== 'dictionary') {
            throw Error('UI Error: Data provided to embedData() not valid list or dictionary.');
        }

        if (actualNode === false) {
            container = $A.app.containerElement(container);
        }

        if ($A.generic.checkVariableType(container) !== 'domelement') {
            throw Error('UI Error: Dom element container could not be used in embedData()');
        }

        if (typeData === 'list') {            
            data.forEach((itm) => {
                if ($A.generic.checkVariableType(itm) === 'dictionary') {
                    $A.generic.loopObject(itm, (key, value) => {
                        let elem = container.querySelector('.embed.' + key);
                        $A.app.mapKeyValueToDom(elem, key, value);
                    });
                }
            });
        }

        if (typeData === 'dictionary') {
            $A.generic.loopObject(data, (key, value) => {
                let elem = container.querySelector(`.embed.${key}`);
                $A.app.mapKeyValueToDom(elem, key, value);
            });
        }
    },

    /**
     * Maps any dictionary's keys/values to matching elements in provided DOM Node.
     * 
     * @todo: add more handling of various data types to this embending function
     * 
     * @param {domElem} node: node to update
     * @param {str} key: key of dataobject matched to dom.
     * @param {*} value: data to embed in dome node.
     * @returns HTML DOM Element
     */
    mapKeyValueToDom: function (node, key, value) {
        if ($A.generic.checkVariableType(node) === 'domelement') {
            node.textContent = $A.forms.escapeHtml(value);
        }
    },

    /**
     * Generates new Tab Button Node based on provided template, with appropriate settings.
     * 
     * @param {domElement} paneNodeTemplate: Pane Node to use as template. Must ahve valid keys/nodes.
     * @param {str} key: key to sub into Pane code.
     * @param {str} name: Full name to display in Tab Button content.
     * @param {bool} isDefault: should we treat this Pane as active? 
     * @returns HTML DOM node for Tab btn.
     */
    makeNewTab: function (tabNodeTemplate, key, name, isDefault = false) {
        if ($A.generic.checkVariableType(tabNodeTemplate) !== 'domelement') {
            throw Error('UI Error: Dom element tabNodeTemplate for makeNewTab() not valid.');
        }

        let clone = tabNodeTemplate.cloneNode(true);

        if ($A.generic.checkVariableType(clone) !== 'domelement') {
            throw Error('UI Error: Dom element clone for makeNewTab() not valid.');
        }

        let btn = clone.querySelector('.tab.nav-link');
        
        if ($A.generic.checkVariableType(btn) !== 'domelement') {
            throw Error('UI Error: Dom element btn for makeNewTab() not valid.');
        }

        // here we set all the variables...
        const extraText = isDefault ? 'default' : '';
        const active = isDefault ? 'active' : '';
        const selected = isDefault ? 'true' : 'false';

        btn.setAttribute('id', `tab-${key}-btn`);
        btn.classList.add(active);
        btn.setAttribute('data-tab-name', key);
        btn.setAttribute('aria-controls', `pane-${key}`);
        btn.setAttribute('aria-selected', selected);
        btn.setAttribute('data-extra', extraText);
        btn.textContent = name;
        clone.appendChild(btn);
        clone.classList.remove('d-none');

        return clone;
    },

    /**
     * Generates new Pane Node based on provided template, with appropriate settings.
     * Note: only returns '.tab-pane' node, if found.
     * 
     * @param {domElement} paneNodeTemplate: Pane Node to use as template. Must ahve valid keys/nodes.
     * @param {str} key: key to sub into Pane code.
     * @param {bool} isDefault: should we treat this Pane as active? 
     * @returns HTML DOM node for Pane.
     */
    makeNewPane: function (paneNodeTemplate, key, isDefault = false) {
        if ($A.generic.checkVariableType(paneNodeTemplate) !== 'domelement') {
            throw Error('UI Error: Dom element paneNodeTemplate for makeNewPane() not valid.');
        }

        let pane = paneNodeTemplate.cloneNode(true);
        if ($A.generic.checkVariableType(pane) !== 'domelement') {
            throw Error('UI Error: Dom element pane for makeNewPane() not valid.');
        }
        
        let results = pane.querySelector('.tab-results');
        if ($A.generic.checkVariableType(results) !== 'domelement') {
            throw Error('UI Error: Dom element for results in makeNewPane() not valid.');
        }

        // here we set all the variables...
        const active = isDefault ? 'active' : '';
        pane.setAttribute('id', `pane-${key}`);
        pane.classList.remove('d-none');
        pane.classList.add(active);
        pane.setAttribute('aria-labelledby', `tab-${key}-btn`);
        results.setAttribute('id', `${key}Container`);

        pane.appendChild(results);

        return pane;
    }
};

