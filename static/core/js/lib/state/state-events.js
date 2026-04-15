import $A from "../../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Triggers all components with a data.stateInitialize = true
     */
    initializeAllComponents: function(container = document) {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);
        const app = $A.state.dom.getAppFromDom();

        components.forEach(async (component) => {
            if (component.dataset.stateInitialize === 'true' || component.dataset.stateInitialize === true) {
                let meta = await $A.state.meta.capture(component, true, app);
                
                if ($A.generic.isVariableEmpty(meta)) {
                    return null;
                }
                if(await this.validateMapperFields(meta)) {
                    console.log('|| initiating component: ', meta.componentString, meta.mapper);
                    await $A.state.trigger(meta.componentString, meta.mapper, null, meta.fromCache);
                }                
            }
        });
    },

    /**
     * Confirms all required mapper fields are available before calling state.trigger()
     * @param {dict} meta 
     * @returns bool
     */
    validateMapperFields: async function(meta) {
        if ($A.generic.checkVariableType(meta.mapper) !== 'dictionary') {
            return false;
        }

        let exec = await $A.state.get.component(meta);
        let valid = true;
        if (exec === null) { 
            return false; 
        };

        exec.mapper.forEach((arg) => {
            let key = arg;
            let type = null;
            if ($A.generic.checkVariableType(arg) === 'list'){
                [ key, type ] = arg;
            }
            let val = $A.generic.getter(meta.mapper, key, null);
            if (val === null) {
                valid = false;
                return;
            }
            let parsed = $A.generic.parse(val);
            if (type !== null && $A.generic.checkVariableType(parsed) !== type) {
                valid = false;
                return;
            }
        });
        return valid;
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

        components.forEach(async (elem) => {
            const meta = await $A.state.meta.capture(elem, true, app);
            const component = await $A.state.get.component(meta);
            if (component !== null) {
                if (component.tbls.includes(tbl)){
                    await $A.state.resetData(meta.mapper, meta);

                    if ($A.generic.parse(meta.initialize) === true && await this.validateMapperFields(meta)) {
                        console.log('|| initiating component: ', component.name);
                        await $A.state.trigger(component.name, meta.mapper, null, false);
                    }
                }
            }
        });
    },

    /**
     * Listens for BootStrap events of modal, offCanvas and Tab pane open and close.
     * Allows us to add state events for each event appropriately.
     */
    listenForBSEvents: function() {
        // Modal events
        document.addEventListener('shown.bs.modal', (e) => { 
            let pane = e.target;
            $A.state.events.activateArea(pane);
        });
        document.addEventListener('hidden.bs.modal', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.events.deActivateArea(pane);
            });
        });

        // Offcanvas events
        document.addEventListener('shown.bs.offcanvas', (e) => { 
            let pane = e.target;
            $A.state.events.activateArea(pane);
        });
        document.addEventListener('hidden.bs.offcanvas', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.events.deActivateArea(pane);
            });
        });

        // Tab events
        document.addEventListener('shown.bs.tab', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.events.activateArea(pane);
            });
        });
        document.addEventListener('hidden.bs.tab', (e) => { 
            let panes = e.target.ariaControlsElements;
            panes.forEach((pane) => {
                $A.state.events.deActivateArea(pane);
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
            let children = $A.state.events.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                if ($A.generic.parse(child.dataset.stateInitialize) === false) {
                    console.log('--- component marked for activation: ', child.id);
                    child.dataset.stateInitialize = true;
                }
            });
            this.initializeAllComponents();
        }
    },

    deActivateArea: async function(pane) {
        if ($A.generic.checkVariableType(pane) === 'domelement') {
            pane.dataset.stateActiveArea = false;
            let children = $A.state.events.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                if ($A.generic.parse(child.dataset.stateInitialize) === true) {
                    console.log('--- component marked for deactivation: ', child.id);
                    child.dataset.stateInitialize = false;
                }
            });
            this.initializeAllComponents();
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
            let event = btn.dataset.stateTriggerType;
            $A.state.events.eventListener(event, btn, async (e) => {
                e.preventDefault();
                let trigger = e.currentTarget;
                let meta = await $A.state.meta.capture(trigger, false);
                if (meta === null || $A.generic.isVariableEmpty(meta)) {
                    console.warn('State DOM Warning: Could not capture metadata for trigger button', trigger, meta);
                    return;
                }

                let componentMeta = $A.state.dom.generateMeta(meta.componentString, true);
                let newMapper = $A.generic.merge(componentMeta.mapper, meta.mapper);
                if (this.validateMapperFields(componentMeta)) {
                    console.log('|| initiating component: ', componentMeta.componentString, newMapper);
                    await $A.state.trigger(componentMeta.componentString, newMapper, componentMeta, meta.fromCache);
                }
            });
        });
    },
};

