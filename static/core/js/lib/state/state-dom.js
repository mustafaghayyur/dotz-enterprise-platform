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
        let elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(componentString, false));
        if (elemTmp === null) {
            const pts = componentString.split('.');
            if (pts.length > 1) {
                elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[1], false));
                if (elemTmp === null) {
                    elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[0], false));
                    meta = await $A.state.meta.captureChild(componentString, elemTmp, true);
                } else {
                    meta = await $A.state.meta.captureChild(componentString, elemTmp, true);
                }
            }
            meta = null;
        }

        meta = await $A.state.meta.capture(elemTmp, true);
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
     * All mapper attributes will be nullified, except those marked 'keep'.
     * Any child component will be set to data-state-initialize='decoy' unless it 
     * has data-state-dismantle='false'.
     * @param {dict} meta 
     */
    dismantleComponent: function(meta) {
        if ($A.base.not(meta, 'dictionary')) { return null; }
        let elem;
        if (meta.containerId === meta.componentName) {
            elem = $A.dom.obtainElementCorrectly(meta.containerId, false);
        } else {
            elem = $A.dom.obtainElementCorrectly(meta.componentName, false);
        }
        if (elem === null) { return null; }

        let data = this.datasetAtrributes(elem);
        let keep = $A.base.get(meta, 'keep', []);

        if ($A.base.not(keep, 'list')) {
            console.warn('State Error: data-state-keep not in array format.', meta, elem);
            keep = [];
        }

        $A.base.loop(data, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                if (!keep.includes(id)) {
                    delete elem.dataset[key];
                }
            }
        });

        if (meta.componentRoot !== meta.componentName) {
            let dismantle = $A.base.get(meta, 'dismantle', true);
            if (dismantle === true || dismantle === 'true') {
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
     * @returns meta | null on error
     */
    update: function(meta) {
        if (meta.containerId !== meta.componentName) { return null; }
        let elem = $A.dom.obtainElementCorrectly(meta.containerId, false);
        if (elem === null) { return null; }

        let component = $A.state.get.component(meta);
        if (component === null) { return null; }
        let data = this.datasetAtrributes(elem);
        
        $A.base.loop($A.state.meta.map, (keyOne, params) => {
            if (keyOne === 'mapper') { return null; } // mapper set seperately
            let [keyTwo, defaultValue] = params;
            let inMeta = $A.meta.get(meta.componentString, keyOne, defaultValue);
            let inDom = $A.base.parse($A.base.get(data, keyTwo, defaultValue));
            if (inMeta !== defaultValue) {
                elem.dataset[keyTwo] = $A.base.stringify(inMeta, false);
            }
            if (inDom !== defaultValue && inMeta === defaultValue) {
                $A.meta.set(meta.componentString, keyOne, $A.base.parse(inDom), false);
            }
        });

        $A.base.loop(meta.mapper, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            let id = 'stateMapper' + $A.base.capitalizeFirstLetter(key);
            let domval = $A.base.get(data, 'id', null);
            elem.dataset[id] = (domval === null) ? $A.base.stringify(value, false) : domval;
            $A.meta.setMapper(meta.componentString, key, value, false);
        });

        $A.base.loop(data, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                $A.meta.setMapper(meta.componentString, id, value, false);
            }
        });

        let ignored = ['component', 'fetch', 'mapper', 'identifier']
        $A.base.loop(component, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            if (ignored.includes(key)) { return null; }
            $A.meta.set(meta.componentString, key, value, 'merge');
        });
        return $A.state.meta.snapshots[meta.componentString];
    },

    
    /**
     * Allows adding of key/value pairs to specified dom element.
     * Data can be retrived with: e.currentTarget.dataset.stateMapper...
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
    datasetAtrributes: function(elem, app = null) {
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
    cleanComponentDom: function(meta) {
        if (meta.containerId !== meta.componentName) { return null; }
        
        let [container, responseContainer] = $A.dom.containers(meta);
        console.log('[clean] - checking conainer and responseContainer: ' + meta.containerId);
        
        if (!container || !container.id) {
            // Warning: The logs show "snapshotted container: " (empty string). 
            // You cannot reliably cache elements without a unique ID!
            console.warn("cleanComponentDom: Container is missing a valid ID.", container);
            return;
        }

        // Check the central registry using the container's ID
        if (!this.snapshots[container.id]) {
            // First time seeing this ID: Take the snapshot
            this.snapshots[container.id] = container.innerHTML;
            console.log(`[clean] - snapshotted container: ${container.id}`);
        } else {
            // Subsequent loads: Restore the DOM from the central registry
            container.innerHTML = this.snapshots[container.id];
            console.log(`[clean] - cleaned container: ${container.id}`);
        }

        $A.app.snapshotInceptionState(responseContainer);
    }
};
