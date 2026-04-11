import $A from "../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Fetches app name as defined in data-state-app-name attribute in body tag of app.
     * @returns dom elem | throws error
     */
    getAppFromDom: function() {
        const app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName

        if($A.generic.isVariableEmpty(app)) {
            throw Error('State Error: App name could not be found in DOM.');
        }
        return app;
    },

    /**
     * Triggers all components with a data.stateInitialize = true
     */
    initializeAllComponents: async function(container = document) {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        const app = $A.state.dom.getAppFromDom();

        components.forEach(async (component) => {
            if (component.dataset.stateInitialize === 'true' || component.dataset.stateInitialize === true) {
                let meta = $A.state.dom.captureComponentData(component, true, app);
                
                if ($A.generic.isVariableEmpty(meta)) {
                    console.warn('Component has no state attributes: ', component, meta);
                    return null;
                }
                $A.state.trigger(meta.componentString, meta.mapper, meta);
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

        const app = $A.state.dom.getAppFromDom();
        const components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        
        components.forEach((elem) => {
            const meta = $A.state.dom.captureComponentData(elem, true, app);
            const mod = $A.generic.getter($A.components, meta.id, null);
            if (mod !== null) {
                $A.generic.loopObject(mod, (key, comp) => {
                    if (comp.tbls.includes(tbl)){
                        $A.state.resetData(meta.componentString, meta.mapper, meta);

                        if (meta.initialize === 'true' || meta.initialize === true) {
                            $A.state.trigger(meta.componentString, meta.mapper, meta, false);
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
            app = $A.state.dom.getAppFromDom();
        }

        let stateAttrs = $A.dom.datasetAtrributes(elem);
        const id = elem.id;
        let componentName = id;
        let componentIdentifier = null;

        const partsOfId = id.split('-');
        if (partsOfId.length > 1) {
            componentName = partsOfId[0];
            componentIdentifier = partsOfId[1]; // @todo: not used by state-system? investigate...
        }
        
        let data = {
            id: id,
            initialize: $A.generic.getter(stateAttrs, 'stateInitialize', false),
            mapper: {},
            componentName: componentName,
            componentIdentifier: componentIdentifier,
            componentString: $A.generic.getter(stateAttrs, 'stateComponent', null),
            tbls: $A.generic.parse($A.generic.getter(stateAttrs, 'stateTblKeys', '[]')),
            app: app,
            trigger: $A.generic.getter(stateAttrs, 'stateTrigger', null),
            fromCache: $A.generic.getter(stateAttrs, 'stateFromCache', true),
        };

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
            data.componentName = name;
            data.componentString = path;
        }

        return data;
    },

    /**
     * Performs validation of data-state-* attributes and id=*.
     * Throws console warnings incase of errors.
     * 
     * @param {dict} data 
     * @param {dom} elem 
     * @returns returns validated data | null on failiures
     */
    validateComponentData: function(data, elem) {
        if ($A.generic.isVariableEmpty(data.app) || $A.generic.checkVariableType(data.app) !== 'string') {
            console.warn('State Error: App name could not be found in DOM element.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.componentName)) {
            if ($A.generic.isVariableEmpty(elem.id)) {
                console.warn("State Error: Component element's id could not be found in DOM element.", elem, data);
                return null
            }
            data.componentName = elem.id;
        }

        if ($A.generic.isVariableEmpty(data.componentString)) {
            if ($A.generic.isVariableEmpty(elem.id)) {
                console.warn("State Error: Component element's id could not be found in DOM element.", elem, data);
                return null
            }
            data.componentString = elem.id;
        }

        if ($A.generic.isVariableEmpty(elem.id) && !$A.generic.isVariableEmpty(data.componentName)) {
            data.id  = data.componentName;
            elem.id = data.componentName;
            data.componentString = data.componentName;
        }

        if ($A.generic.isVariableEmpty(elem.id)) {
            console.warn("State Error: Component element's id could not be found in DOM element.", elem, data);
            return null
        }

        const boolOpts = ['true', 'false', 'decoy'];
        if ($A.generic.checkVariableType(data.initialize) !== 'boolean' && !boolOpts.includes(data.initialize)) {
            console.warn('State Error: StateInitialize has to be enum of "true" | "false" | "decoy" in DOM element.', elem, data);
            return null;
        }

        const tbls = data.tbls;
        if ($A.generic.checkVariableType(tbls) !== 'list') {
            console.warn('State Error: Component did not specify valid data-state-tbl-keys in array form, in DOM element.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.componentName)) {
            console.warn('State Error: Component-Name could not be found in DOM element.', elem, data);
            return null;
        }

        return data;
    },

    /**
     * Listens for BootStrap events of modal, offCanvas and Tab pane open and close.
     * Allows us to add state events for each event appropriately.
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
     * 
     * @param {str} identifier: string to parse
     * @returns array of 2 parts [componentName, componentString]
     */
    extractComponentName: function(identifier) {
        if ($A.generic.checkVariableType(identifier) !== 'string') {
            console.warn('DOM Error: extractComponentName() recieved a non-string component-name-identifier.');
            return [null, null];
        }
        const compParts = identifier.split('.');
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
            $A.state.dom.eventListener('click', btn, (e) => {
                e.preventDefault();
                let meta = $A.state.dom.captureComponentData(e.currentTarget, false);
                $A.state.trigger(meta.componentString, meta.mapper, meta, meta.fromCache);
            });
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

