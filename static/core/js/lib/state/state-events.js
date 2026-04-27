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
                
                if ($A.base.empty(meta)) {
                    return null;
                }
                if(await $A.state.meta.validateMapperFields(meta)) {
                    console.log('||1 initiating component: ', meta.componentString, meta.mapper);
                    await $A.state.trigger(meta.componentString, meta.mapper, null, meta.fromCache);
                }     
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
    triggerAllForTable: function(tbl, container = null) {
        if ($A.base.not(tbl, 'string')) {
            throw Error('State Error: triggerAllForTable() needs string tbl-code');
        }

        if ($A.base.not(container, 'domelement')) {
            container = document;
        }

        const app = $A.state.dom.getAppFromDom();
        const components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);

        components.forEach(async (elem) => {
            const meta = await $A.state.meta.capture(elem, true, app);
            const component = await $A.state.get.component(meta);
            if (component !== null) {
                if ($A.base.get(component, 'tbls', []).includes(tbl)){
                    await $A.state.resetData(meta.mapper, meta);

                    if ($A.base.parse(meta.initialize) === true && await $A.state.meta.validateMapperFields(meta)) {
                        console.log('||2 initiating component: ', component.name);
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
            this.iteratePanes(e.target, this.activateArea);
        });
        document.addEventListener('hidden.bs.modal', (e) => { 
            this.iteratePanes(e.target.ariaControlsElements, this.deActivateArea);
        });

        // Offcanvas events
        document.addEventListener('shown.bs.offcanvas', (e) => { 
            this.iteratePanes(e.target, this.activateArea);
        });
        document.addEventListener('hidden.bs.offcanvas', (e) => { 
            this.iteratePanes(e.target.ariaControlsElements, this.deActivateArea);
        });

        // Tab events
        document.addEventListener('shown.bs.tab', (e) => { 
            this.iteratePanes(e.target.ariaControlsElements, this.activateArea);
        });
        document.addEventListener('hidden.bs.tab', (e) => { 
            this.iteratePanes(e.target.ariaControlsElements, this.deActivateArea);
        });

        // collapse events
        document.addEventListener('shown.bs.collapse', (e) => { 
            this.iteratePanes(e.target, this.activateArea);
        });
        document.addEventListener('hidden.bs.collapse', (e) => { 
            this.iteratePanes(e.target, this.deActivateArea);
        });
    },

    /**
     * Calls a callback on provided node-list.
     * @param {array} panes 
     * @param {func} callback 
     */
    iteratePanes: function(panes, callback) {
        if ($A.base.not(panes, 'list')) {
            panes = [panes];
        }

        panes.forEach((pane) => {
            callback(pane);
        });
    },

    /**
     * Attempts to manage components and other parts during pane activation
     * @param {dom} pane 
     */
    activateArea: function(pane) {
        if ($A.base.is(pane, 'domelement')) {
            pane.dataset.stateActiveArea = true;
            let children = $A.state.events.getTopLevelStateInitChildren(pane);
            children.forEach(async (child) => {
                if ($A.base.parse(child.dataset.stateInitialize) === false) {
                    console.log('--- component marked for activation: ', child.id);
                    child.dataset.stateInitialize = true;
                    if (child.dataset.stateOnDisplay === 'true') {
                        // @todo: test state-on-display behavior
                        let meta = $A.state.dom.generateMeta(child.id, true);
                        if (await $A.state.meta.validateMapperFields(meta)) {
                            console.log('||5 initiating component: ', meta.componentString, meta, meta.mapper);
                            await $A.state.trigger(meta.componentString, meta.mapper, meta, meta.fromCache);
                        }
                    }
                }
            });
            // this.initializeAllComponents();
        }
    },

    /**
     * Attempts to manage components and other parts during pane closing
     * @param {dom} pane 
     */
    deActivateArea: async function(pane) {
        if ($A.base.is(pane, 'domelement')) {
            pane.dataset.stateActiveArea = false;
            let children = $A.state.events.getTopLevelStateInitChildren(pane);
            children.forEach((child) => {
                if ($A.base.parse(child.dataset.stateInitialize) === true) {
                    console.log('--- component marked for deactivation: ', child.id);
                    child.dataset.stateInitialize = false;
                }
            });
            // this.initializeAllComponents();
        }
    },

    getTopLevelStateInitChildren: function(root) {
        if ($A.base.not(root, 'domelement')) {
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
        // Initialize a dictionary on the element to store callback references
        if (!elem._stateCallbacks) {
            elem._stateCallbacks = {};
        }
        
        // If a listener for this specific event type already exists, remove it
        if (elem._stateCallbacks[eventType]) {
            elem.removeEventListener(eventType, elem._stateCallbacks[eventType]);
        }
        elem.setAttribute('data-listener-data', data);
        elem.addEventListener(eventType, callback);
        elem._stateCallbacks[eventType] = callback;
    },

    activateTriggers: function (container = document) {
        // activate triggers throughout software...
        const triggerBtns = $A.dom.searchAllElementsCorrectly('[data-state-trigger]', container);
        triggerBtns.forEach(async (btn) => {
            let meta = await $A.state.meta.capture(btn, false);

            $A.state.events.eventListener(meta.triggerEvent, btn, async (e) => {
                e.preventDefault();
                let trigger = e.currentTarget;
                
                // Dynamically re-capture metadata on event execution to capture JS-appended attributes
                let currentMeta = await $A.state.meta.capture(trigger, false);

                if ($A.base.empty(currentMeta) || $A.base.not(currentMeta, 'dictionary')) {
                    console.warn('State DOM Warning: Could not capture metadata for trigger button: ', trigger, currentMeta);
                    return;
                }

                let componentMeta = await $A.state.dom.generateMeta(currentMeta.componentString, true);
                if (componentMeta === null) { return null; }
                let newMapper = $A.base.merge($A.base.get(componentMeta, 'mapper', {}), $A.base.get(currentMeta, 'mapper', {}));
                componentMeta.mapper = newMapper;

                if (await $A.state.meta.validateMapperFields(componentMeta)) {
                    console.log('||3 initiating component: ', componentMeta.componentString);
                    await $A.state.trigger(componentMeta.componentString, newMapper, componentMeta, currentMeta.fromCache);
                }
            }, $A.base.stringify(meta, false));
        });
    },

    /**
     * @todo: implement this project-wide somehow.
     *  > also look into: show.bs.modal event combined with event.relatedTarget
     * 
     * Cleaning up after modal-hide:
     */
    closeBootstrapPanes: function(containerId, event) {
        const container = $A.dom.obtainElementCorrectly(containerId);
        container.addEventListener('hidden.bs.modal', function() {
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
    }
};
