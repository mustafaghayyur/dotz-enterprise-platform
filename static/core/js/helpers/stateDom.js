import $A from "../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Triggers all components with a data.stateInitialize = true
     */
    initializeAllComponents: async function(container = document) {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        const app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName

        components.forEach(async (component) => {
            if (component.dataset.stateInitialize === 'true' || component.dataset.stateInitialize === true) {
                let meta = $A.state.dom.captureComponentData(component, true, app);
                
                if ($A.generic.isVariableEmpty(meta)) {
                    console.warn('Component has no state attributes: ', component, meta);
                    return null;
                }
                $A.state.trigger(meta.component, meta.mapper, meta);
            }
        });
    },

    /**
     * Finds all components within (provided) container and attempts to trigger 
     * fetch operation on them. Useful for app-wide state update for certain table.
     * 
     * @param {*} tbl 
     * @param {*} container 
     */
    triggerAllForTable: function(tbl, container) {
        if ($A.generic.checkVariableType(tbl) !== 'string') {
            throw Error('State Error: triggerAllForTable() needs string tbl-code');
        }

        if ($A.generic.checkVariableType(container) !== 'domelement') {
            container = document;
        }

        const app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName
        components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        components.forEach((elem) => {
            const meta = $A.state.dom.captureComponentData(elem, true, app);
            const mod = $A.generic.getter($A.components, meta.component, null);
            if (mod !== null) {
                $A.generic.loopObject(mod, (key, comp) => {
                    if (comp.tbls.includes(tbl)){
                        $A.state.resetData(meta.component, key, meta.mapper, meta);

                        if (meta.initialize === 'true' || meta.initialize === true) {
                            $A.state.trigger(meta.component, key, meta.mapper, meta);
                        }
                    }
                });
            }
        });
    },

    /**
     * Attempts to capture all relevent data for State module from given element.
     * 
     * @param {dom} elem: dom entity to parse
     * @param {bool} forSetup: if true, setup operations for StateUpdate will be performed.
     * @returns 
     */
    captureComponentData: function(elem, forSetup = true, app = null) {
        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            throw Error('DOM Error: triggerSingleForTable() needs HTMLElement as component');
        }

        if (app === null) {
            app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName;
        }

        let stateAttrs = $A.dom.datasetAtrributes(elem);
        const [componentName, componentPath] = $A.state.dom.extractComponentName($A.generic.getter(stateAttrs, 'stateComponent', ''));
        const id = elem.id;
        const componentKey = null;
        const compoenentNameNew = null;

        if (!$A.generic.isVariableEmpty(id)) {
            const partsOfId = id.split('-');
            if (partsOfId.length > 1) {
                compoenentNameNew = partsOfId[0];
                componentKey = partsOfId[1];

                if (componentName !== compoenentNameNew) {
                    componentName = compoenentNameNew;
                }
            }
        }
        
        let data = {
            id: elem.id,
            initialize: $A.generic.getter(stateAttrs, 'stateInitialize', false),
            mapper: {},
            key: componentKey,
            component: componentName,
            componentPath: componentPath,
            componentString: $A.generic.getter(stateAttrs, 'stateComponent', ''),
            tbls: $A.generic.parse($A.generic.getter(stateAttrs, 'stateTblKeys', '[]')),
            app: app,
            trigger: $A.generic.getter(stateAttrs, 'stateTrigger', null),
        };
        console.log('Checking data vs stateAttrs', data, stateAttrs.stateInitialize, stateAttrs['stateInitialize']);

        if (data.initialize === 'decoy') {
            return {}; // component has yet to be formed
        }

        $A.generic.loopObject(stateAttrs, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.generic.lowercaseFirstLetter(key.slice(11));
                console.log('Is StateMapper field coming out correct?', id, value);
                data.mapper[id] = value;
            }
        });

        if (forSetup) {
            data = $A.state.dom.validateComponentData(data, elem);
        }

        if (!$A.generic.isVariableEmpty(data.trigger) && $A.generic.isVariableEmpty(data.componentString)){
            const [name, path] = $A.state.dom.extractComponentName(data.trigger);
            data.component = data.name;
            data.componentPath = data.path;
            data.componentString = data.trigger;
        }

        return data;
    },

    validateComponentData: function(data, elem) {
        if ($A.generic.isVariableEmpty(data.app) || $A.generic.checkVariableType(data.app) !== 'string') {
            console.warn('State Error: App name could not be found in DOM.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.component)) {
            if ($A.generic.isVariableEmpty(elem.id)) {
                console.warn('State Error: Component id could not be found in DOM.', elem, data);
                return null
            }
            data.component = elem.id;
            data.componentPath = elem.id;
        }

        const boolOpts = ['true', 'false', 'decoy'];
        if ($A.generic.checkVariableType(data.initialize) !== 'boolean' && !boolOpts.includes(data.initialize)) {
            console.warn('State Error: StateInitialize could not be found in DOM.', elem, data);
            return null;
        }

        const tbls = data.tbls;
        if ($A.generic.checkVariableType(tbls) !== 'list') {
            console.warn('State Error: Component did not specify valid tbl-keys list in DOM.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.component)) {
            console.warn('State Error: ComponentName or Trigger Key could not be found in DOM.', elem, data);
            return null;
        }

        return data;
    },

    /**
     * Listens for BootStrap events of modal, offCanvas and Tab pane open and close.
     * Allows us to add StateUpdate and StateTrigger events of our own.
     */
    listenForBSEvents: function() {
        // Modal events
        document.addEventListener('shown.bs.modal', (e) => { 
            let pane = e.target;
            $A.state.dom.activateArea(pane);
        });
        document.addEventListener('hidden.bs.modal', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.dom.deActivateArea(pane);
            });
        });

        // Offcanvas events
        document.addEventListener('shown.bs.offcanvas', (e) => { 
            let pane = e.target;
            $A.state.dom.activateArea(pane);
        });
        document.addEventListener('hidden.bs.offcanvas', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.dom.deActivateArea(pane);
            });
        });

        // Tab events
        document.addEventListener('shown.bs.tab', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.dom.activateArea(pane);
            });
        });
        document.addEventListener('hidden.bs.tab', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.dom.deActivateArea(pane);
            });
        });


        /**
         * @todo: implement this project-wide somehow.
         * 
         * > also look into: show.bs.modal event combined with event.relatedTarget
         * 
         * Cleaning up after model-hide:
         * const modalElement = document.getElementById('tempModal');

            modalElement.addEventListener('hidden.bs.modal', function() {
            // Dispose of Bootstrap instance
            const modalInstance = bootstrap.Modal.getInstance(this);
            if (modalInstance) {
                modalInstance.dispose();
            }
            
            // Remove from DOM if it was dynamically created
            if (this.dataset.temporary === 'true') {
                this.remove();
            }
            });
        */
    },


    activateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateActiveArea = true;
            let children = $A.state.dom.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                child.dataset.stateInitialize = true;
            });
            console.log('Activated area: ' + pane.id);
            await $A.state.dom.initializeAllComponents();
        }
    },

    deActivateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateActiveArea = false;
            let children = $A.state.dom.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                child.dataset.stateInitialize = false;
            });
            console.log('Deactivated area: ' + pane.id);
            await $A.state.dom.initializeAllComponents();
        }
    },

    getTopLevelStateInitChildren: function(root) {
        if ($A.generic.checkVariableType(root) !== 'domelement') {
            return [];
        }

        let result = [];
        let queue = Array.from(root.children);

        while (queue.length > 0) {
            const node = queue.shift();
            if (node.hasAttribute('data-state-initialize')) {
                result.push(node);
                continue; // do not traverse further inside this subtree
            }
            // only traverse if this node is not itself a state-initialize node
            queue.push(...Array.from(node.children));
        }

        return result;
    },

    /**
     * Parses string for component name and path
     * @param {*} componentString: string to parse
     * @returns array of 2 parts [compName, compPath]
     */
    extractComponentName: function(componentString) {
        if ($A.generic.checkVariableType(componentString) !== 'string') {
            console.warn('DOM Error: extractComponentName() recieved a non-string component-name-string.');
            return [null, null];
        }
        const compParts = componentString.split('|');
        if (compParts.length > 1) {
            return [compParts[1],  compParts[0] + '.' + compParts[1]];
        } else {
            return [compParts[0], compParts[0]];
        }
    },

    /**
     * Allows non-multiplying event listeners to be added to elements.
     * User e.currentTarget.dataset... to retrived binded data
     * 
     * @param {str} eventType: JS event to listen for ('click', 'change', etc..)
     * @param {domElem} container: event-listener dom element
     * @param {func} callback: callback to handle specific operations upon event. 'e' is passed along to this func.
     * @param {obj} data: any data you wish to pass to crud operation
     */
    eventListener: function(eventType, elem, callback, data = {}) {
        elem.setAttribute('data-state-listener-data', data);
        if (!elem.hasStateListener) {
            elem.addEventListener(eventType, callback);
        }
        elem.hasStateListener = true;
    },

    activateTriggers: function (container = document) {
        // activate triggers throughout software...
        const triggerBtns = $A.dom.searchAllElementsCorrectly('[data-state-trigger]', container);
        triggerBtns.forEach((btn) => {
            let dict = $A.state.dom.captureComponentData(btn, false);
            $A.state.dom.eventListener('click', btn, (e) => {
                e.preventDefault();
                const raw = e.currentTarget.dataset.stateListenerData;
                const data = $A.generic.parse(raw);
                const state = $A.state.get.record(data.key);
                if ($A.generic.getter(state, component) === null) {
                    return null;
                }
                $A.state.trigger(data.key, data.mapper, false);
            }, $A.generic.stringify(dict));
        });
    },

    /**
     * Allows adding of key/value pairs to specified dom element.
     * Date can be retrived with: e.currentTarget.dataset.stateMapper...
     * 
     * @param {htmldom} elem: dom node to add data attributes to
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    addMapperArguments: function (elem, key, value) {
        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            console.warn('State DOM Error: addArgs() received a non-dom elem.', elem, key, value);
            return null;
        }
        if ($A.generic.checkVariableType(key) !== 'string') {
            console.warn('State DOM Error: addArgs() received a non-string key.', elem, key, value);
            return null;
        }
        if ($A.generic.checkVariableType(value) !== 'string') {
            value = $A.generic.stringify(value);
        }

        elem.setAttribute('data-state-mapper-' + key, value);
        return null;
    }
};

