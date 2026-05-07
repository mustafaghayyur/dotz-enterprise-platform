import $A from "../../helper.js";

/**
 * State Library Helper functions.
 * Found in $A.state.dom
 * Carries operations enabling State and UX features
 */
export default {
    /**
     * Component's DOM snapshots (registry)  
     */
    snapshots: {},

    /**
     * Fetches app name as defined in data-state-app-name attribute in body tag of app.
     * @returns dom elem | throws error
     */
    getAppFromDom: function() {
        const app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName

        if($A.base.empty(app)) {
            throw Error('State Error: App name could not be found in DOM.');
        }
        return app;
    },

    /**
     * Attempts to generate new meta object from provided componentString.
     * 
     * @param {str} componentString: pathTo.Component in string format
     * @param {bool} initialize: should we force-mark child components as non-decoys? enum true | false | (str)'forMeta'
     * @returns meta obj | null on error (log'd)
     */
    generateMeta: async function(componentString, initialize = false) {
        if ($A.base.not(componentString, 'string')) {
            console.warn('State DOM Error: Could not find a string for "componentString" argument.', componentString);
            return null;
        }
        let meta;
        let isDecoy = false;

        // if we have a meta compiled for component, use record...
        if ($A.meta.get(componentString, 'compiled', false)) {
            let origMeta = $A.meta.record(componentString);
            
            if ($A.meta.get(componentString, 'type', null) !== 'orphan') {
                let containerId = $A.meta.getContainerId(componentString, true);
                let elem = initializeElem(initialize, $A.dom.obtainElementCorrectly(containerId, false));
                meta = this.update(origMeta);
            } else {
                meta = this.update(origMeta, false); // only update mapper args
            }
            return meta;
        }

        // else, attempt to generate a new one...
        let elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(componentString, false));
        if (elemTmp === null) {
            const pts = componentString.split('.');
            if (pts.length > 1) {
                elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[1], false));
                if (elemTmp === null) {
                    let parentId = pts[0];
                    if ($A.meta.get(parentId, 'compiled', false)) {
                        parentId = $A.meta.getContainerId(parentId, true) || parentId;
                    }
                    elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(parentId, false));
                    if (elemTmp === null) {
                        console.warn('State DOM Error: Could not find parent DOM element for: ' + componentString);
                        return null;
                    }
                    meta = await $A.meta.captureChild(componentString, elemTmp, true);
                } else {
                    meta = await $A.meta.captureChild(componentString, elemTmp, true);
                }
            } else {
                meta = null;
            }
        } else {
            meta = await $A.meta.capture(elemTmp, true);
        }

        if (initialize === 'forMeta' && isDecoy && $A.base.is(elemTmp, 'domelement')) {
            elemTmp.dataset.stateInitialize = 'decoy';
        }
        return meta;
    
        /**
         * For 'decoy' sub-components we will remove the decoy and 
         * mark as true initialization.
         */
        function initializeElem(initialize, elem) {
            if (initialize !== false && $A.base.is(elem, 'domelement')) {
                isDecoy = (elem.dataset.stateInitialize === 'decoy') ? true : false;
                elem.dataset.stateInitialize = true;
            }
            return elem;
        } 
    },

    /**
     * Only updates component's DOM element data attributes.
     * All mapper attributes marked in 'resetArgs' attribute of component definition will be reset.
     * Any child component will be set to data-state-initialize='decoy' unless it 
     * has data-state-dismantle='false'.
     * 
     * @todo: this is where the meta.mapper should be cleaned? Is this right? Figure out
     * @param {dict} meta 
     */
    dismantleComponent: function(meta) {
        if ($A.base.not(meta, 'dictionary')) { return null; }
        let elem = null;
        if (meta.containerId === meta.componentName) {
            let containerId = $A.meta.getContainerId(meta.componentString, true);
            elem = $A.dom.obtainElementCorrectly(containerId, false);
        }
        if (elem === null) { return null; }

        let data = this.datasetAttributes(elem);
        let resetArgs = $A.base.get(meta, 'resetArgs', []);

        if ($A.base.not(resetArgs, 'list')) {
            console.warn('State Error: meta.resetArgs not in array format for: ' + meta.componentName, meta, elem);
            resetArgs = [];
        }

        $A.base.loop(data, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                if (resetArgs.includes(id)) {
                    delete elem.dataset[key];
                }
            }
            if (key === 'listenerData') {
                delete elem.dataset[key]; // delete data-listener-data
            }
        });

        $A.base.loop(meta.mapper, (key, value) => {
            if (resetArgs.includes(key)) {
                $A.meta.deleteMapperKey(meta.componentString, key);
            }
        });

        if (meta.componentRoot !== meta.componentName) {
            let dismantle = $A.base.get(meta, 'dismantle', true);
            if (dismantle === true) {
                elem.dataset.stateInitialize = 'decoy';
            }
        }
    },


    /**
     * Updates meta & DOM with latest attributes.
     * Only 'child' and 'root' components DOM can be updated. 
     * Meta updated for all: root, child, orphans.
     * 
     * @param {dict} meta 
     * @param {bool} fullCreateOperation - true = full operation | false = only mapper args are updated
     * @returns meta | null on error
     */
    update: async function(meta, fullCreateOperation = true) {
        if (meta === null || $A.base.not(meta, 'dictionary') || $A.base.empty(meta)) { return null; }
        
        let elem = null;
        if (meta.containerId !== meta.componentName) {
            let identifier = $A.base.get(meta.mapper, 'containerParts', '');
            identifier = $A.base.empty(identifier) ? '' : '-' + identifier;
            let containerId = meta.containerId + identifier;
            elem = $A.dom.obtainElementCorrectly(containerId, false);
        }

        if (elem === null) { 
            // component is without a DOM-element. Mimic elem for continuance
            elem = $A.dom.makeDomElement('div');
        }

        let component = await $A.state.get.component(meta);
        if (component === null) { return meta; }
        let data = this.datasetAttributes(elem);
        
        // first: copy supplied meta with to dom & meta-snapshots
        if (fullCreateOperation) {
            let ignored = ['mapper', 'identifier']; // these keys have special meaning in a component object, than in meta object.
            $A.base.loop(meta, (keyOne, value) => {
                if (ignored.includes(keyOne)) { return null; }
                if (!keyOne) { return null; }
                //if ($A.base.empty(value)) { return null; } // @todo: confirm behavior later
                let map = $A.meta.map;

                // attempt to fetch meta.map record for keyOne
                let [keyTwo, defaultValue] = $A.base.get(map, keyOne, [null, null]);
                if ($A.base.is(defaultValue, 'list') || $A.base.is(defaultValue, 'dictionary')) {
                    defaultValue = JSON.parse(JSON.stringify(defaultValue));
                }

                let inMeta = $A.base.get(meta, keyOne, defaultValue);
                let inDom = $A.base.parse($A.base.get(data, keyTwo, defaultValue));
                if (inMeta !== defaultValue && inDom === defaultValue) {
                    elem.dataset[keyTwo] = $A.base.stringify(inMeta, false);
                }
                if (inDom !== defaultValue && inMeta === defaultValue) {
                    $A.meta.set(meta.componentString, keyOne, $A.base.parse(inDom)); //@todo: confirm behavior later (overwritten = true)
                } else {
                    $A.meta.set(meta.componentString, keyOne, value); //@todo: confirm behavior later (overwritten = true)
                }
            });
        }
        
        // second: copy meta.mapper to dom & meta-snapshots
        $A.meta.setMapper(meta.componentString, 'let-us-cheat-the-mapper', null, false);
        $A.base.loop(meta.mapper, (key, value) => {
            if ($A.base.empty(key)) { return null; }
            if ($A.base.empty(value)) { return null; }
            let id = 'stateMapper' + $A.base.capitalizeFirstLetter(key);
            let domval = $A.base.get(data, id, null);
            elem.dataset[id] = (domval === null) ? $A.base.stringify(value, false) : domval;
            $A.meta.setMapper(meta.componentString, key, value, false);
        });

        // third: copy over dom-data-mappers to meta-snapshots' mapper
        $A.base.loop(data, (key, value) => {
            if ($A.base.empty(key)) { return null; }
            if ($A.base.empty(value)) { return null; }
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                $A.meta.setMapper(meta.componentString, id, value, false);
            }
        });

        if(fullCreateOperation) {
            // finally: copy over any relevant keys from the component object, itself, to meta-snapshots
            let componentIgnored = ['component', 'fetch', 'mapper', 'identifier']; // these keys have special meaning in a component object, than in meta object.
            $A.base.loop(component, (key, value) => {
                if ($A.base.empty(key)) { return null; }
                if ($A.base.empty(value)) { return null; }
                if (componentIgnored.includes(key)) { return null; }
                $A.meta.set(meta.componentString, key, value, 'merge');
            });
        }

        // mark compiled and return meta record
        $A.meta.set(meta.componentString, 'compiled', true); // mark component meta as compiled.
        return $A.meta.record(meta.componentString);
    },

    
    /**
     * Allows adding of key/value pairs to specified dom element.
     * Data can be retrieved with: e.currentTarget.dataset.stateMapper...
     * 
     * @param {htmldom} elem: dom node to add data attributes to
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    addMapperArguments: function (elem, key, value) {
        if ($A.base.not(elem, 'domelement')) {
            console.warn('State DOM Error: addArgs() received a non-dom elem.', elem, key, value);
            return null;
        }
        if ($A.base.not(key, 'string')) {
            console.warn('State DOM Error: addArgs() received a non-string key.', elem, key, value);
            return null;
        }
        if ($A.base.not(value, 'string')) {
            value = $A.base.stringify(value, false);
        }

        elem.setAttribute('data-state-mapper-' + key, value);
        return null;
    },



    /**
     * Returns a dict of key-value pairs needed by $A.state
     * 
     * @param {HTMLElement} elem 
     * @returns {} dict
     */
    datasetAttributes: function(elem, app = null) {
        if ($A.base.not(elem, 'domelement')) { return {}; }
        let data = elem.dataset;
        data = { ...data };
        data.id = elem.id;
        data.app = (app === null) ? this.getAppFromDom() : app;
        return data;
    },

    /**
     * Cleans and collects snapshots of component doms.
     * Resetting each to its original (inception) state.  
     * @param {dict} meta 
     */
    snapshotOfComponentDom: function(meta) {
        if (meta === null) { return null; }
        if (meta.containerId !== meta.componentName) { return null; }
        let [container, responseBoxStale, identifier] = this.getContainerNodes(meta);
        if (!container || !container.id) { return; }

        // @todo: confirm behavior with container.id keys instead of meta.containerId keys in snapshots registry. This is because of the possibility of multiple instances of the same component on a page.
        if (!$A.base.get(this.snapshots, meta.containerId, false)) {
            this.snapshots[meta.containerId] = container.innerHTML;
            console.log(`[clean] - snapshotted container: ${meta.containerId}. Identifier for this component`, identifier);
        } else {
            if (meta.refresh === true) {
                // Subsequent loads: Restore the DOM from the central registry
                container.innerHTML = this.snapshots[meta.containerId];
                console.log(`[clean] - cleaned container: ${meta.containerId}. Identifier for this component`, identifier);
            }
        }
        
        let responseContainer = $A.dom.obtainElementCorrectly($A.base.get(responseBoxStale, 'id'), false);
        if ($A.base.is(responseContainer, 'domelement')) {
            responseContainer.textContent = '';
            responseContainer.setAttribute('class', ''); // reset any alert classes that may be present
        }
    },

    /**
     * Using State's Meta object we retrieve active container 
     * & responseContainer dom nodes.
     * @returns list [container, responseContainer, identifier]
     */
    getContainerNodes: function(meta) {
        let containerId = $A.meta.getContainerId(meta.componentString, true);
        let responseContainerId = $A.meta.getContainerId(meta.componentString, true, 'response');
        let container = $A.dom.obtainElementCorrectly(containerId, false);
        let responseContainer = $A.dom.obtainElementCorrectly(responseContainerId, false);
        let identifier = $A.meta.getMapper(meta.componentString, 'containerParts', null);
        return [container, responseContainer, identifier];
    }
};
