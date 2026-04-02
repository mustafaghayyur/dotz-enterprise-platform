import $A from "../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Calls $A.state.save() from DOM elements.
     */
    updateState: async function() {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', document);
        components.forEach(async (component) => {
            //console.log('Checking component---------------', component);
            console.log('------------------------------------');
            let data = $A.state.dom.captureComponentData(component, true);
            if ($A.generic.isVariableEmpty(data)) {
                console.warn('Component has no data attributes: ', component, data);
                return null;
            }
            const tables = data.tbl.join('|');
            console.log('Saving component: ', data.key, data);
            await $A.state.save(data.key, `${data.app}.${tables}.${data.component}`, data.mapper, data.fetchFile);
            if (data.initialize === 'true' || data.initialize === true) {
                console.log('Triggering component: ', data.key, data, component);
                $A.state.trigger(data.key);
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

        components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        components.forEach((component) => {
            data = $A.state.dom.captureComponentData(component, false);
            if (tbl in data.tbl){
                $A.state.trigger(data.key, $A.generic.getter(data, 'mapper', {}));
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
    captureComponentData: function(elem, forSetup = true) {
        if ($A.generic.checkVariableType(elem) !== 'domelement') {
            throw Error('DOM Error: triggerSingleForTable() needs HTMLElement as component');
        }

        let stateAttrs = $A.dom.datasetAtrributes(elem);
        let data = {
            initialize: $A.generic.getter(stateAttrs, 'stateInitialize', false),
            mapper: $A.generic.getter(stateAttrs, 'stateMapper', {}),
            key: $A.generic.getter(stateAttrs, 'stateKey', null),
            component: $A.generic.getter(stateAttrs, 'stateComponent', null),
            tbl: $A.generic.parse($A.generic.getter(stateAttrs, 'stateTblKey', '[]')),
            fetchFile: $A.generic.getter(stateAttrs, 'stateFetchFile', 'Default'),
            app: $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName,
        };
        console.log('Checking data vs stateAttrs', data, stateAttrs.stateInitialize, stateAttrs['stateInitialize']);

        if (!$A.generic.isVariableEmpty(data.mapper) && $A.generic.checkVariableType(data.mapper) === 'dictionary') { 
            $A.generic.loopObject(stateAttrs, (key, value) => {
                if (key.startsWith('stateMapper')) {
                    let parts = key.split('-');
                    let key = parts.slice(3).join('-');
                    data.mapper[key] = value;
                }
            });
        }

        if (forSetup) {
            data = $A.state.dom.validateComponentData(data, elem);
        }
        return data;
    },

    validateComponentData: function(data, elem) {
        if ($A.generic.isVariableEmpty(data.app) || $A.generic.checkVariableType(data.app) !== 'string') {
            console.warn('State Error: App name could not be found in DOM.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.key) && $A.generic.isVariableEmpty(data.component)) {
            let compId = elem.id;
            if ($A.generic.isVariableEmpty(compId)) {
                console.warn('State Error: Component id could not be found in DOM.', elem, data);
                return null
            }
            data.key = compId;
            data.component = compId;
        }

        const boolOpts = ['true', 'false'];
        if ($A.generic.checkVariableType(data.initialize) !== 'boolean' && !boolOpts.includes(data.initialize)) {
            console.warn('State Error: StateInitialize could not be found in DOM.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(data.component)) {
            data.component = data.key;
        }

        const tbl = data.tbl;
        if ($A.generic.checkVariableType(tbl) !== 'list') {
            console.warn('State Error: Component did not specify valid tbl-key list in DOM.', elem, data);
            return null;
        }

        if ($A.generic.isVariableEmpty(tbl)) {
            // @todo: tbl-key missing needs to be handled? Decide with time.
        }

        if ($A.generic.isVariableEmpty(data.key)) {
            data.key = data.component;
        }

        if ($A.generic.isVariableEmpty(data.key) || $A.generic.isVariableEmpty(data.component)) {
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
    },

    activateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            //pane.dataset.stateInitialize = true;
            pane.dataset.stateActiveArea = true;
            let children = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', pane);
            children.forEach((child) => {
                child.dataset.stateInitialize = true;
            });
            console.log('Activated area: ' + pane.id);
            await $A.state.dom.updateState();
        }
    },

    deActivateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            //pane.dataset.stateInitialize = false;
            pane.dataset.stateActiveArea = false;
            let children = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', pane);
            children.forEach((child) => {
                child.dataset.stateInitialize = false;
            });
            console.log('Deactivated area: ' + pane.id);
            await $A.state.dom.updateState();
        }
    }
};

