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
     * @param {bool} initialize: should we force-mark child components as non-decoys?
     * @returns meta obj | null on error (log'd)
     */
    generateMeta: async function(componentString, initialize = false) {
        if ($A.base.not(componentString, 'string')) {
            console.warn('State DOM Error: Could not find a string for "componentString" argument.', componentString);
            return null;
        }
        const app = $A.state.dom.getAppFromDom();
        let elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(componentString, false));
        if (elemTmp === null) {
            const pts = componentString.split('.');
            if (pts.length > 1) {
                elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[1], false));
                if (elemTmp === null) {
                    elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[0], false));
                    return await $A.state.meta.captureChild(componentString, elemTmp, true, app);
                } else {
                    return await $A.state.meta.captureChild(componentString, elemTmp, true, app);
                }
            }
            return null;
        }
        return await $A.state.meta.capture(elemTmp, true, app);

        /**
         * For 'decoy' sub-components we will remove the decoy and 
         * mark as true initialization.
         * @param {bool} initialize: true to change decoy components to real components
         * @param {*} elem 
         * @returns 
         */
        function initializeElem(initialize, elem) {
            if (initialize === true) {
                if ($A.base.is(elem, 'domelement')) {
                    elem.dataset.stateInitialize = true;
                }
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
        let keep = $A.base.get(data, 'stateKeep', []);
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
     * Only 'child' and 'root' components can be updated. Orphans cannot.
     * 
     * @param {dict} meta 
     * @returns meta | null on error
     */
    update: function(meta) {
        if (meta.containerId !== meta.componentName) { return null; }
        let elem = $A.dom.obtainElementCorrectly(meta.containerId, false);
        if (elem === null) { return null; }

        let data = this.datasetAtrributes(elem);
        
        $A.base.loop($A.state.meta.map, (keyOne, params) => {
            if (keyOne === 'mapper') { return null; } // mapper set seperately
            let [keyTwo, defaultValue] = params;
            let inMeta = $A.base.get(meta, keyOne, defaultValue);
            let inSnapshot = $A.state.meta.get(snapshot, keyOne, defaultValue);
            let inDom = $A.base.parse($A.base.get(data, keyTwo, defaultValue));
            if (inMeta !== defaultValue) {
                elem.dataset[keyTwo] = $A.base.stringify(inMeta, false);
            }
            if (inDom !== defaultValue && inMeta === defaultValue) {
                meta[keyOne] = $A.base.parse(inDom);
            }
            if (inDom !== defaultValue && inSnapshot === defaultValue) {
                $A.state.meta.set(meta.componentString, keyOne, inDom);
            }
            if (inMeta !== defaultValue && inSnapshot === defaultValue) {
                $A.state.meta.set(meta.componentString, keyOne, inDom);
            }
        });

        $A.base.loop(meta.mapper, (key, value) => {
            // const camelToKebab = (str) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            let id = 'stateMapper' + $A.base.capitalizeFirstLetter(key);
            elem.dataset[id] = $A.base.stringify(value, false);
            if ($A.state.meta.getMapper(meta.componentString, key) === null) {
                $A.state.meta.setMapper(meta.componentString, key, value);
            }
        });

        $A.base.loop(data, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                let original = $A.base.get(meta.mapper, id, null);
                if (original === null) {
                    meta.mapper[id] = $A.base.parse(value);
                }
                if ($A.state.meta.getMapper(meta.componentString, id) === null) {
                    $A.state.meta.setMapper(meta.componentString, id, value);
                }
            }
        });
        return meta;
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
