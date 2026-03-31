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
            data = $A.state.dom.captureComponentData(component, true);
            await $A.state.save(data.key, `${data.app}.${$A.generic.getter(data, tbl, '')}.${data.component}`, $A.generic.getter(data, mapper, {}), $A.generic.getter(data, fetchFile, 'Default'));
            if (data.initialize) {
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
                $A.state.trigger(data.key, $A.generic.getter(data, mapper, {}));
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

        stateAttrs = $A.dom.filterAtrributes(elem, 'data-state', null);
        let data = {};
        data.mapper = {};
        stateAttrs.forEach((attr) => {
            if (attr[0] === 'data-state-initialize') {
                data.initialize = attr[1];
            }
            if (attr[1].startsWith('data-state-mapper')) {
                let parts = attr[0].split('-');
                let key = parts.slice(3).join('-');
                data.mapper[key] = attr[1];
            }
            if (attr[0] === 'data-state-key') {
                data.key = attr[1];
            }
            if (attr[0] === 'data-state-component') {
                data.component = attr[1];
            }
            if (attr[0] === 'data-state-tbl-key') {
                data.tbl = $A.generic.parse(attr[1]);
            }
        });
        data.app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName;

        if (forSetup) {
            data = $A.state.dom.validateComponentData(data, elem);
        }
        return data;
    },

    validateComponentData: function(data, elem) {
        if ($A.generic.isVariableEmpty($A.generic.getter(data, app)) || $A.generic.checkVariableType($A.generic.getter(data, app)) !== 'string') {
            console.error('State Error: App name could not be found in DOM.', elem, data);
            throw Error('State Error: App name could not be found in DOM for component, or is not in string format.');
        }

        if ($A.generic.isVariableEmpty($A.generic.getter(data, key)) && $A.generic.isVariableEmpty($A.generic.getter(data, component))) {
            compId = elem.id;
            if ($A.generic.isVariableEmpty(compId)) {
                console.error('State Error: Component id could not be found in DOM.', elem, data);
                throw Error('State Error: Component id could not be found in DOM for component.');
            }
            data.key = compId;
            data.component = compId;
        }

        if ($A.generic.checkVariableType($A.generic.getter(data, initialize)) !== 'boolean') {
            console.error('State Error: StateInitialize could not be found in DOM.', elem, data);
            throw Error('State Error: StateInitialize has to be a bool value for component id: ' + data.component +'.');
        }

        if ($A.generic.isVariableEmpty($A.generic.getter(data, component))) {
            data.component = data.key;
        }

        const tbl = $A.generic.getter(data, tbl, []);
        if ($A.generic.checkVariableType(tbl) !== 'list') {
            console.error('State Error: Component did not specify valid tbl-key list in DOM.', elem, data);
            throw Error('State Error: Component did not specify valid tbl-key list in DOM.');
        }

        if ($A.generic.isVariableEmpty(tbl)) {
            // @todo: tbl-key missing needs to be handled? Decide with time.
        }

        if ($A.generic.isVariableEmpty($A.generic.getter(data, key))) {
            data.key = data.component;
        }

        if ($A.generic.isVariableEmpty($A.generic.getter(data, key)) || $A.generic.isVariableEmpty($A.generic.getter(data, component))) {
            console.error('State Error: ComponentName or Trigger Key could not be found in DOM.', elem, data);
            throw Error('State Error: ComponentName or Trigger Key could not be found in DOM for component.');
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

    activateArea: function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateInitialize = true;
            pane.dataset.stateActiveArea = true;
            $A.state.dom.updateState();
        }
    },

    deActivateArea: function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateInitialize = false;
            pane.dataset.stateActiveArea = false;
            $A.state.dom.updateState();
        }
    }
};

