import $A from "../../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Finds all components within (provided) container and attempts to trigger 
     * fetch operation on them, if they are related to the specified table.
     * Useful for app-wide state update for certain table.
     * 
     * @param {*} tblIdentifier 
     * @param {*} container 
     */
    triggerAllForTable: function(tblIdentifier, container = null) {
        if ($A.base.not(tblIdentifier, 'string')) {
            throw Error('State Error: triggerAllForTable() needs string tbl-code');
        }
        if ($A.base.not(container, 'domelement')) {
            container = document;
        }
        const components = $A.meta.snapshots;
        $A.base.loop(components, async (componentString, origMeta) => {
            let meta = await $A.state.dom.update(origMeta, false); // only update mapper args
            const component = await $A.state.get.component(meta);
            if (component === null || meta === null) { return null; }
            
            let tables = $A.base.get(component, 'tbls', []);
            if (!tables.includes(tblIdentifier)){ return null; }
            
            // first we erase cache for component...
            await $A.state.resetData(meta.mapper, meta);
            
            // next we attempt to find and trigger component if it is in an 'active' pane 
            let elemId = $A.meta.getContainerId(componentString, true);
            let elem = $A.dom.obtainElementCorrectly(elemId, false);
            if (elem === null) { return null; }

            // @todo: improve method of determining active pane
            if (elem.closest('[data-state-initialize="true"]') === null) { return null; } 
            if (await $A.meta.validateMapperFields(meta)) {
                console.log('||2| initiating component: ', component.name);
                await $A.state.call(component.name, meta.mapper, null, false);
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
            // This prevents "Blocked aria-hidden on an element because its descendant retained focus" warning
            document.body.focus();
        });

        // Offcanvas events
        document.addEventListener('shown.bs.offcanvas', (e) => { 
            this.iteratePanes(e.target, this.activateArea);
        });
        document.addEventListener('hidden.bs.offcanvas', (e) => { 
            this.iteratePanes(e.target.ariaControlsElements, this.deActivateArea);
            // This prevents "Blocked aria-hidden on an element because its descendant retained focus" warning
            document.body.focus();
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
            // This prevents "Blocked aria-hidden on an element because its descendant retained focus" warning
            document.body.focus();
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
                    if ($A.base.parse(child.dataset.stateOnDisplay) === true) {
                        // @todo: test state-on-display behavior
                        let meta = await $A.state.dom.generateMeta(child.id, true);
                        if (await $A.meta.validateMapperFields(meta)) {
                            console.log('||5| initiating component: ', meta.componentString, meta, meta.mapper);
                            await $A.state.call(meta.componentString, meta.mapper, meta, meta.fromCache);
                        }
                    }
                }
            });
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
     * Use e.currentTarget.dataset... to retrieve bound data
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
            let meta = await $A.meta.capture(btn, false);
            if (meta === null) { return null; }
            $A.state.events.eventListener(meta.triggerEvent, btn, async (e) => {
                e.preventDefault();
                let trigger = e.currentTarget;
                
                // Dynamically re-capture metadata on event execution to capture JS-appended attributes
                let currentMeta = await $A.meta.capture(trigger, false);

                if ($A.base.empty(currentMeta) || $A.base.not(currentMeta, 'dictionary')) {
                    console.warn('State DOM Warning: Could not capture metadata for trigger button: ', trigger, currentMeta);
                    return null;
                }

                const componentMetaFromSnapshot = await $A.state.dom.generateMeta(currentMeta.componentString, true);
                if (componentMetaFromSnapshot === null) { return null; }
                // Deep copy the meta object to prevent mutating the shared snapshot record. This is the "DEEP CLEAN".
                let componentMeta = JSON.parse(JSON.stringify(componentMetaFromSnapshot));
                componentMeta.mapper = $A.base.merge($A.base.get(componentMeta, 'mapper', {}), $A.base.get(currentMeta, 'mapper', {}));

                if (await $A.meta.validateMapperFields(componentMeta)) {
                    console.log('...triggered component: ' + componentMeta.componentString);
                    await $A.state.call(componentMeta.componentString, componentMeta.mapper, componentMeta, currentMeta.fromCache);
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
    },
    /**
     * Captures all components from DOM and processes them.
     * Also triggers all components with a data.stateInitialize = true.
     */
    initializeAllComponents: function(container = document, initOperation = false) {
        let components = $A.dom.searchAllElementsCorrectly('[data-state-initialize]', container);

        components.forEach(async (elem) => {
            // generate & save initial meta record in $A.meta.snapshots
            let meta = await $A.state.dom.generateMeta(elem.id, 'forMeta');
            if ($A.base.empty(meta)) { return null; }
            
            if (initOperation) {
                // save initial DOM image in $A.state.dom.snapshots
                $A.state.dom.snapshotOfComponentDom(meta); 
            }
            
            if ($A.base.parse(elem.dataset.stateInitialize) === true) {
                if(await $A.meta.validateMapperFields(meta)) {
                    console.log('||1| initiating component: ', meta.componentString, meta.mapper);
                    await $A.state.call(meta.componentString, meta.mapper, null, meta.fromCache);
                }
            }
        });
    },
};
