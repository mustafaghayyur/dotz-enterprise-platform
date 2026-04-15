import $A from "../../helper.js";

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

    /**
     * Attempts to generate new meta object from provided componentString.
     * 
     * @param {str} componentString: pathTo.Component in string format
     * @param {bool} initialize: should we force-mark child components as non-decoys?
     * @returns meta obj | null on error (log'd)
     */
    generateMeta: async function(componentString, initialize = false) {
        if ($A.generic.checkVariableType(componentString) !== 'string') {
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
                if ($A.generic.checkVariableType(elem) === 'domelement') {
                    elem.dataset.stateInitialize = true;
                }
            }
            return elem;
        } 
    },

    /**
     * Any child component's DOM will be set to 'decoy' unless it has data-state-dismantle='false'
     * @param {dict} meta 
     */
    dismantleSubComponent: function(meta) {
        if ($A.generic.checkVariableType(meta) !== 'dictionary') {
            return null;
        }
        if ($A.generic.getter(meta, 'dismantle', true) === false || $A.generic.getter(meta, 'dismantle', true) === 'false') {
            return null;
        }

        if (meta.componentRoot !== meta.componentName) {
            let elemTmp = $A.dom.obtainElementCorrectly(meta.componentName, false);
            if (elemTmp !== null) {
                elemTmp.dataset.stateInitialize = 'decoy';
            }
        }
    },


    /**
     * Reconciles meta with Component's DOM element.
     * 
     * @param {dict} meta 
     * @returns meta | null on error
     */
    update: async function(meta) {
        let elem = $A.dom.obtainElementCorrectly(meta.id, false);
        if (elem === null) { return null; }
        if (elem.id !== meta.componentName) { return null; }

        let data = { ...elem.dataset };
        $A.generic.loopObject(this.map, (keyOne, params) => {
            let [keyTwo, defaultValue] = params;
            let inMeta = $A.generic.getter(meta, keyOne, defaultValue);
            let inDom = $A.generic.parse($A.generic.getter(data, keyTwo, defaultValue));
            if (inMeta !== null) {
                elem.dataset[keyTwo] = $A.generic.stringify(inMeta);
            }
            if (inDom !== null && inMeta === null) {
                meta[keyOne] = $A.generic.parse(inDom);
            }
        });

        $A.generic.loopObject(meta.mapper, (key, value) => {
            // const camelToKebab = (str) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            let id = 'stateMapper' + $A.generic.capitalizeFirstLetter(key);
            elem.dataset[id] = $A.generic.stringify(value);
        });

        $A.generic.loopObject(data, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.generic.lowercaseFirstLetter(key.slice(11));
                let original = $A.generic.getter(meta.mapper, id, null);
                if (original === null) {
                    meta.mapper[id] = $A.generic.parse(value);
                }
            }
        });

        return meta;
    },


    /**
     * Updates Coponent DOM with meta info
     * @param {dom} elem 
     * @param {dict} meta 
     */
    updateDom: function(elem, meta) {
        if ($A.generic.checkVariableType(elem) === 'domelement') {
            if ($A.generic.checkVariableType(meta) === 'dictionary') {
                try {    
                    elem.dataset.stateInitialize = $A.generic.stringify(meta.initialize);
                    elem.dataset.stateComponent = meta.componentString;
                    elem.dataset.stateTblKeys = $A.generic.stringify(meta.tbls);
                    //elem.dataset.stateTrigger = meta.trigger;
                    //elem.dataset.stateTriggerType = meta.triggerEvent;
                    elem.dataset.stateFromCache = $A.generic.stringify(meta.fromCache);
                    elem.dataset.stateDismantle = $A.generic.stringify(meta.dismantle);

                    $A.generic.loopObject(meta.mapper, (key, value) => {
                        elem.setAttribute('data-state-mapper-' + camelToKebab(key), $A.generic.stringify(value));
                    });
                } catch (err) {
                    let blank = (err) => { return null; };
                }
            }
        }
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

