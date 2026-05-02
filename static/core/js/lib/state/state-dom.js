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

        // if we have a meta compiled for component, return...
        if ($A.meta.get(componentString, 'compiled', false)) {
            meta = $A.meta.record(componentString);
            if ($A.meta.get(componentString, 'type', null) !== 'orphan') {
                let elem = initializeElem(initialize, $A.dom.obtainElementCorrectly(componentString, false));
                this.update(meta);
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
                    elemTmp = initializeElem(initialize, $A.dom.obtainElementCorrectly(pts[0], false));
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
     * All mapper attributes will be nullified, except those marked 'keep'.
     * Any child component will be set to data-state-initialize='decoy' unless it 
     * has data-state-dismantle='false'.
     * 
     * @todo: this is where the meta.mapper should be cleaned? Is this right? Figure out
     * @param {dict} meta 
     */
    dismantleComponent: function(meta) {
        if ($A.base.not(meta, 'dictionary')) { return null; }
        let elem = null;
        if (meta.containerId === meta.componentName) { //@todo: make universal elem retrieval for components to accommodate id with identifier
            elem = $A.dom.obtainElementCorrectly(meta.containerId, false);
        }
        if (elem === null) { return null; }

        let data = this.datasetAttributes(elem);
        let keep = $A.base.get(meta, 'keep', []);

        if ($A.base.not(keep, 'list')) {
            console.warn('State Error: meta.keep not in array format for: ' + meta.componentName, meta, elem);
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

        delete elem.dataset[listenerData]; // also delete data-listener-data attributes from component 

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
     * @returns meta | null on error
     */
    update: async function(meta) {
        if (meta.containerId !== meta.componentName) { return null; }
        let elem = $A.dom.obtainElementCorrectly(meta.containerId, false);
        if (elem === null) { return null; }

        let component = await $A.state.get.component(meta);
        if (component === null) { return null; }
        let data = this.datasetAttributes(elem);
        
        // first: copy supplied meta with to dom & meta-snapshots
        $A.base.loop(meta, (keyOne, value) => {
            if (keyOne === 'mapper') { return null; } // mapper set separately
            if (!keyOne) { return null; }
            let map = $A.meta.map;

            // attempt to fetch meta.map record for keyOne
            let [keyTwo, defaultValue] = $A.base.get(map, keyOne, [null, null]);

            let inMeta = $A.base.get(meta, keyOne, defaultValue);
            let inDom = $A.base.parse($A.base.get(data, keyTwo, defaultValue));
            if (inMeta !== defaultValue && inDom === defaultValue) {
                elem.dataset[keyTwo] = $A.base.stringify(inMeta, false);
            }
            if (inDom !== defaultValue && inMeta === defaultValue) {
                $A.meta.set(meta.componentString, keyOne, $A.base.parse(inDom), false);
            } else {
                $A.meta.set(meta.componentString, keyOne, value, false);
            }
        });

        $A.meta.setMapper(meta.componentString, 'let-us-cheat-the-mapper', null, false);
        
        // second: copy meta.mapper to dom & meta-snapshots
        $A.base.loop(meta.mapper, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            let id = 'stateMapper' + $A.base.capitalizeFirstLetter(key);
            let domval = $A.base.get(data, 'id', null);
            elem.dataset[id] = (domval === null) ? $A.base.stringify(value, false) : domval;
            $A.meta.setMapper(meta.componentString, key, value, false);
        });

        // third: copy over dom-data-mappers to meta-snapshots' mapper
        $A.base.loop(data, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                $A.meta.setMapper(meta.componentString, id, value, false);
            }
        });

        // finally: copy over any relevant keys from the component object, itself, to meta-snapshots
        let ignored = ['component', 'fetch', 'mapper', 'identifier']; // these keys have special meaning in a component object, than in meta object.
        $A.base.loop(component, (key, value) => {
            if ($A.base.empty(value)) { return null; }
            if (ignored.includes(key)) { return null; }
            $A.meta.set(meta.componentString, key, value, 'merge');
        });

        // mark compiled and return meta record
        $A.meta.set(meta.componentString, 'compiled', true); // mark component meta as compiled.
        console.log('META saved to mem: ' + meta.componentName, JSON.parse(JSON.stringify($A.meta.record(meta.componentString))));
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
        let [container, responseContainer, identifier] = $A.dom.getContainerNodes(meta);
        if (!container || !container.id) { return; }

        if (!$A.base.get(this.snapshots, container.id, false)) {
            this.snapshots[container.id] = container.innerHTML;
            console.log(`[clean] - snapshotted container: ${container.id}. Identifier for this component`, identifier);
        } else {
            // Subsequent loads: Restore the DOM from the central registry
            container.innerHTML = this.snapshots[container.id];
            console.log(`[clean] - cleaned container: ${container.id}. Identifier for this component`, identifier);
        }
        //if ($A.base.is(responseContainer, 'domelement')) {
        //    responseContainer.innerHTML = '';
        //} @todo: remove this if not needed
    }
};
