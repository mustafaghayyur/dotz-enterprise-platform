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

    validateMeta: async function(componentString, meta) {
        if ($A.generic.checkVariableType(meta) !== 'dictionary') {
            const app = $A.state.dom.getAppFromDom();
            let elemTmp = $A.dom.obtainElementCorrectly(componentString, false);
            if (elemTmp === null) {
                const pts = componentString.split('.');
                if (pts.length > 1) {
                    elemTmp = $A.dom.obtainElementCorrectly(pts[1], false);
                    if (elemTmp === null) {
                        elemTmp = $A.dom.obtainElementCorrectly(pts[0], false);
                        return await $A.state.dom.captureChildComponentData(componentString, elemTmp, true, app);
                    } else {
                        return await $A.state.dom.captureChildComponentData(componentString, elemTmp, true, app);
                    }
                } else {
                    return await $A.state.dom.captureChildComponentData(componentString, elemTmp, true, app);
                }
            }
            return await $A.state.dom.captureComponentData(elemTmp, true, app);
        }

        if ($A.generic.checkVariableType(componentString) === 'string' && !$A.generic.isVariableEmpty(componentString)) {
            meta.componentString = componentString;
        }

        return meta;
    },

    /**
     * Triggers all components with a data.stateInitialize = true
     */
    initializeAllComponents: function(container = document) {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        const app = $A.state.dom.getAppFromDom();

        components.forEach(async (component) => {
            if (component.dataset.stateInitialize === 'true' || component.dataset.stateInitialize === true) {
                let meta = await $A.state.dom.captureComponentData(component, true, app);
                
                if ($A.generic.isVariableEmpty(meta)) {
                    console.warn('Component has no state attributes: ', component, meta);
                    return null;
                }
                await $A.state.trigger(meta.componentString, meta.mapper, meta);
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
    triggerAllForTable: async function(tbl, container) {
        if ($A.generic.checkVariableType(tbl) !== 'string') {
            throw Error('State Error: triggerAllForTable() needs string tbl-code');
        }

        if ($A.generic.checkVariableType(container) !== 'domelement') {
            container = document;
        }

        const app = $A.state.dom.getAppFromDom();
        const components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        const compModule = await $A.components(app);

        components.forEach(async (elem) => {
            const meta = await $A.state.dom.captureComponentData(elem, true, app);
            const mod = $A.generic.getter(compModule, meta.id, null);
            if (mod !== null) {
                $A.generic.loopObject(mod, async (key, comp) => {
                    if (comp.tbls.includes(tbl)){
                        await $A.state.resetData(meta.mapper, meta);

                        if (meta.initialize === 'true' || meta.initialize === true) {
                            await $A.state.trigger(meta.componentString, meta.mapper, meta, false);
                        }
                    }
                });
            }
        });
    },

    /**
     * The elem is for parent component. So the meta capture will be
     * different.
     */
    captureChildComponentData: async function(componentString, elem, forSetup = true, app = null) {
        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            console.warn('State DOM Error: captureChildComponentData() needs HTMLElement as component', componentString, elem);
            return null;
        }

        let stateAttrs = $A.dom.datasetAtrributes(elem);
        
        let data = {
            id: elem.id,
            initialize: $A.generic.getter(stateAttrs, 'stateInitialize', 'false'),
            mapper: {}, // cannot take parent's mapper
            componentString: componentString, // crtical: we are overwriting component name info with child pertinent info...
            tbls: [], // cannot be parent's tables
            app: (app === null) ? $A.state.dom.getAppFromDom() : app,
            trigger: null, // cannot be triggered without own id
            fromCache: $A.generic.getter(stateAttrs, 'stateFromCache', 'true'),
        };

        if (data.initialize === 'decoy') {
            return {}; // component has yet to be formed
        }

        if (!$A.generic.isVariableEmpty(data.trigger) && $A.generic.isVariableEmpty(data.componentString)){
            data.componentString = data.trigger;
        }

        data = await $A.state.dom.fixComponentData(data);

        if (forSetup) {
            data = $A.state.dom.validateComponentData(data);
        }

        return data;
    },


    /**
     * Attempts to capture all relevent data for State module from given element.
     * 
     * @param {dom} elem: dom entity to parse
     * @param {bool} forSetup: if true, setup operations for StateUpdate will be performed.
     * @returns 
     */
    captureComponentData: async function(elem, forSetup = true, app = null) {
        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            console.warn('DOM Error: captureComponentData() needs HTMLElement as component', elem);
            return null;
        }

        let stateAttrs = $A.dom.datasetAtrributes(elem);
        
        let data = {
            id: elem.id,
            initialize: $A.generic.getter(stateAttrs, 'stateInitialize', 'false'),
            mapper: {},
            componentString: $A.generic.getter(stateAttrs, 'stateComponent', null),
            tbls: $A.generic.parse($A.generic.getter(stateAttrs, 'stateTblKeys', '[]')),
            app: (app === null) ? $A.state.dom.getAppFromDom() : app,
            trigger: $A.generic.getter(stateAttrs, 'stateTrigger', null),
            triggerEvent: $A.generic.getter(stateAttrs, 'stateTriggerType', 'click'),
            fromCache: $A.generic.getter(stateAttrs, 'stateFromCache', true),
        };

        if (data.initialize === 'decoy') {
            return {}; // component has yet to be formed
        }

        $A.generic.loopObject(stateAttrs, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.generic.lowercaseFirstLetter(key.slice(11));
                data.mapper[id] = value;
            }
        });

        if (!$A.generic.isVariableEmpty(data.trigger) && $A.generic.isVariableEmpty(data.componentString)){
            data.componentString = data.trigger;
        }

        if (forSetup) {
            data = await $A.state.dom.fixComponentData(data);
            data = $A.state.dom.validateComponentData(data);
        }
        console.log('MG - stateAttrs: ', data);

        return data;
    },


    /**
     * Makes full attempt at deciphering name, path and any identifiers 
     * found in meta data.
     * 
     * @param {str} meta 
     * @returns Returns {meta} | returns null and throws console errors on failiure
     */
    fixComponentData: async function (meta) {
        const components = await $A.components(meta.app);
        let path = $A.generic.getter(meta, 'componentString', null);
        let id = $A.generic.getter(meta, 'id', null);

        if (path === null) {
            if (id !== null) {
                meta.componentString = id;
                path = id;
            } else {
                console.warn('State DOM Error: Component definition lacking any component identifier (i.e. id or data-state-component attributes).', meta);
                return null;
            }
        }

        if (id === null) {
            meta.id = meta.componentString;
            id = meta.componentString;
        }
        
        const pts1 = path.split('.');
        const pts2 = id.split('-');
        console.log('MG - this is for you: ', pts1, pts2, path, id);

        meta.containerId = pts2[0];
        meta.responseContainerId = meta.containerId + 'Response';
        meta.containerParts = pts2.slice(1).join('-');

        if (pts1.length === 1) {
            meta.componentName = pts1[0];
            meta.componentString = pts1[0];
            meta.componentRoot = pts1[0];
        }
        if (pts1.length > 1) {
            meta.componentName = pts1[1];
            meta.componentString = `${pts1[0]}.${pts1[1]}`;
            meta.componentRoot = pts1[0];
        }

        const module = $A.generic.getter(components, meta.componentRoot, null);

        if (module === null) {
            console.warn('State DOM Error: Component Root failed to fetch component.', meta, components);
            return null;
        }

        if (meta.componentName !== meta.componentRoot) {
            let found = false;
            $A.generic.loopObject(module, (key, comp) => {
                if (key === meta.componentName) {
                    found = true;
                }
            });

            if (!found) {
                console.warn('State DOM Error: Could not fetch component with suggested component-name value: ' + meta.componentName + '', meta);
                return null;
            }
        } 
        
        return meta;
    },

    /**
     * Performs validation of data-state-* attributes and id=*.
     * Throws console warnings incase of errors.
     * 
     * @param {dict} data: aka meta
     * @param {dom} elem 
     * @returns returns validated data | null on failiures
     */
    validateComponentData: function(data, elem) {
        if ($A.generic.isVariableEmpty(data.app) || $A.generic.checkVariableType(data.app) !== 'string') {
            console.warn('State DOM Error: App name could not be found in DOM.', data, elem);
            return null;
        }

        const name = $A.generic.getter(data, 'componentName', null);
        const path = $A.generic.getter(data, 'componentString', null);
        const id = $A.generic.getter(data, 'id', null);
        const boolOpts = ['true', 'false', 'decoy'];

        if (name === null && path === null && id === null) {
            console.warn(`State DOM Error: No component info can be found in DOM for element: `, data, elem);
            return null;
        }
        
        if ($A.generic.checkVariableType(data.initialize) !== 'boolean' && !boolOpts.includes(data.initialize)) {
            console.warn('State DOM Error: StateInitialize has to be enum of "true" | "false" | "decoy" in DOM elements: ', data, elem);
            return null;
        }

        const tbls = data.tbls;
        if ($A.generic.checkVariableType(tbls) !== 'list') {
            console.warn('State DOM Error: Component did not specify valid data-state-tbl-keys in array form, in DOM element: ', data, elem);
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
            $A.state.dom.initializeAllComponents();
        }
    },

    deActivateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateActiveArea = false;
            let children = $A.state.dom.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                child.dataset.stateInitialize = false;
            });
            $A.state.dom.initializeAllComponents();
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
        triggerBtns.forEach(async (btn) => {
            let meta = await $A.state.dom.captureComponentData(btn, false);
            
            if (meta === null || $A.generic.isVariableEmpty(meta)) {
                console.warn('State DOM Warning: Could not capture metadata for trigger button', btn, meta);
                return;
            }
            
            const triggerEvent = meta.triggerEvent || 'click';
            $A.state.dom.eventListener(triggerEvent, btn, async (e) => {
                e.preventDefault();
                await $A.state.trigger(meta.componentString, meta.mapper, meta, meta.fromCache);
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

