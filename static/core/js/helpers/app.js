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
        if ($A.generic.checkVariableType(key) !== 'string') {
            throw Error('UI Error: cannot save non-string keys to localstorage.');
        }

        if ($A.generic.isPrimitiveValue(value)) {
            localStorage.setItem(key, value);
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
     * Fetches the user object for specified ID and saves to localstorage.
     * If user id exists in localstorage, retrieves that value.
     * @param {number} user_id 
     * @param {array} fields 
     */
    user: function (user_id, containerId, returnNull = false, iter = 0) {
        if (iter > 1) {
            if (returnNull) {
                return null;
            }
            throw Error('UI Error: could not find user with id: ' + user_id + ' in system. Maximum attempts reached.');
        }

        user_id = Number(user_id);

        const users = $A.app.memFetch('users', true);

        let user = $A.generic.getter(users, user_id);

        if (!user) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name', 'email', 'user_level')
                .where({usus_id: user_id, usus_delete_time: null}).execute(containerId, (data, containerId, mapper) => {
                    let users = mapper.users;

                    if ($A.generic.checkVariableType(data) === 'list') {
                        data = data[0];
                    }

                    if ($A.generic.isVariableEmpty(data)) {
                        if (returnNull) {
                            return null;
                        }

                        throw Error('UI Error: could not find user with id: ' + user_id + '. Fetch attempt failed.');
                    }

                    if ($A.generic.checkVariableType(data) === 'dictionary') {
                        if ($A.generic.getter(data, 'usus_id') && data.usus_id === user_id) {
                            if ($A.generic.isVariableEmpty(users)) {
                                users = {};
                            }
                            users[user_id] = data;
                            $A.app.memSave('users', users);
                        }
                    }
                }, { users: users });

            user = $A.app.user(user_id, containerId, returnNull, iter = (iter + 1));
        }

        if (!user) {
            if (returnNull) {
                return null;
            }
            throw Error('UI Error: could not find user with id: ' + user_id + ' in system. Something went wrong.');
        }

        return user;
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
            throw Error(`DOM Error: Provided searchString not in string format: ${searchString}`);
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

    /**
     * Embeds provided API data into matching .embed.{key} nodes of containerId.
     * Does NOT create new nodes.
     * 
     * @param {*} data: api data reultset
     * @param {str} containerId: dom HTML element id (without the '#' prefix). Or actual node instance with 'actualNode' flag set to true
     * @param {bool} actualNode: true if actual DOM node is being passed in container.
     */
    embedData: function(data, containerId, actualNode = false) {
        const typeData = $A.generic.checkVariableType(data);
        let container = containerId;

        if (typeData !== 'list' && typeData !== 'dictionary') {
            throw Error('UI Error: Data provided to embedData() not valid list or dictionary.');
        }

        if (actualNode === false) {
            container = $A.app.containerElement(containerId);
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

        return container;
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
        let clone = tabNodeTemplate.cloneNode(true);

        if ($A.generic.checkVariableType(clone) !== 'domelement') {
            throw Error('DOM Error: Dom element clone for makeNewTab() not valid.');
        }

        let btn = $A.app.searchElementCorrectly('.tab.nav-link', clone);
        
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
        let pane = paneNodeTemplate.cloneNode(true);
        
        if ($A.generic.checkVariableType(pane) !== 'domelement') {
            throw Error('DOM Error: Dom element pane for makeNewPane() not valid.');
        }
        
        let results = $A.app.searchElementCorrectly('.tab-results', pane);
        
        // here we set all the variables...
        const active = isDefault ? 'active' : '';
        pane.setAttribute('id', `pane-${key}`);
        pane.classList.remove('d-none');
        pane.classList.add(active);
        pane.setAttribute('aria-labelledby', `tab-${key}-btn`);
        results.setAttribute('id', `${key}Container`);

        pane.appendChild(results);

        return pane;
    },

    /**
     * Sets everything up to allow for Modals to safely execute events.
     * Without modal dom duplication causing problems.
     * 
     * @param {dom} container: instance of DOM node element
     * @param {str} dataKey: data-key to pass along. Use e.currentTarget.getAttribute() to get acces to this key
     * @param {*} dataValue: value for data-key
     * @param {str} eventType: event-listener string identifyer (click, change, etc)
     * @param {func} callback: actions to perform on event trigger.
     */
    wrapEventListeners: function(container, dataKey, dataValue, eventType, callback) {
        container.setAttribute(dataKey, dataValue);
        if (!container.hasDeleteListener) {
            container.addEventListener(eventType, callback);
        }
        container.hasDeleteListener = true;
    }
};

