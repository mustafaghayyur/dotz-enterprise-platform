import $A from "../../helper.js";
import dom from "../../helpers/dom.js";

/**
 * Manages Component's meta objects
 */
export default {
    /**
     * Central repository of meta snapshots
     */
    snapshots: {},

    map: {
        id: ['id', null],
        initialize: ['stateInitialize', false],
        mapper: ['mapper', {}],
        componentString: ['stateComponent', null],
        tbls: ['stateTblKeys', []],
        app: ['app', null],
        trigger: ['stateTrigger', null],
        triggerEvent: ['stateTriggerType', 'click'],
        fromCache: ['stateFromCache', true],
        dismantle: ['stateDismantle', true],
        type: ['stateType', 'root'],
    },

    set: function (componentString, key, value, overwrite = true) {
        if ($A.base.not(this.snapshots, 'dictionary')) {
            this.snapshots[componentString] = {};
        }
        if (!overwrite) {
            let original = $A.base.get(this.snapshots, key, null);
            if (original !== null) { return null; }
        }
        this.snapshots[componentString][key] = $A.base.parse(value);
    },

    get: function (componentString, key, defaultValue = null) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        return $A.base.get(this.snapshots[componentString], key, defaultValue);
    },

    setMapper: function (componentString, key, value, overwrite = true) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if ($A.base.get(this.snapshots[componentString], 'mapper', null) === null) {
            this.snapshots[componentString].mapper = {};
        }
        if (!overwrite) {
            let original = $A.base.get(this.snapshots[componentString].mapper, key, null);
            if (original !== null) { return null; }
        }
        this.snapshots[componentString].mapper[key] = $A.base.parse(value);
    },

    getMapper: function (componentString, key, defaultValue = null) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if ($A.base.get(this.snapshots, 'mapper', null) === null) {
            this.snapshots[componentString].mapper = {};
        }
        return $A.base.get(this.snapshots[componentString].mapper, key, defaultValue);
    },

    /**
     * Attempts to capture all relevent data for State module from given element.
     * 
     * This component has no DOM counterpart. It is instead associated
     * with its parent component's containerId. 
     * Thus some operations will be different.
     * 
     * @param {str} componentString: full path to sub-component
     * @param {dom} elem: can be that of sub-component OR parent component
     * @param {bool} forSetup: for setup or just trigger element parsing
     * @param {str} app: app name
     * @returns meta obj | null on error
     */
    captureChild: async function(componentString, elem, forSetup = true, app = null) {
        if ($A.base.not(elem, 'domelement')) {
            console.warn('State DOM Error: meta.captureChild() needs HTMLElement as component', componentString, elem);
            return null;
        }

        let data = $A.state.dom.datasetAtrributes(elem, app);
        let actualElement = false;

        if (elem.id === componentString.split('.')[1]) {
            actualElement = true;
        }

        const map = this.map;
        const ignore = ['componentString', 'tbls', 'trigger', 'fromCache', 'dismantle'];

        let meta = $A.base.loop(map, (key, params) => {
            let [domKey, defaultValue] = params;
            if (domKey === 'mapper') { return defaultValue; } // mapper set seperately
            let legit = ignore.includes(key) ? false : true;
            return (legit) ? $A.base.parse($A.base.get(data, domKey, defaultValue)) : defaultValue;
        });

        // Ensure the intended component identity is assigned before processing
        meta.componentString = componentString;

        if (meta.initialize === 'decoy') {
            return null; // component has yet to be formed
        }

        if (actualElement) {
            meta.mapper = this.captureMapperValues(data);
        }

        if (!$A.base.empty(meta.trigger) && $A.base.empty(meta.componentString)){
            meta.componentString = meta.trigger;
        }

        if (forSetup) {
            meta = await this.fixComponentData(meta);
            meta = this.validateComponentData(meta);
            if (meta === null) {
                return null;
            }
        }

        $A.state.dom.update(meta);
        return meta;
    },


    /**
     * Attempts to capture all relevent data for State module from given element.
     * 
     * @param {dom} elem: dom entity to parse
     * @param {bool} forSetup: if true, setup operations for StateUpdate will be performed.
     * @returns 
     */
    capture: async function(elem, forSetup = true, app = null) {
        if ($A.base.not(elem, 'domelement')) {
            console.warn('DOM Error: meta.capture() needs HTMLElement as component', elem);
            return null;
        }

        let data = $A.state.dom.datasetAtrributes(elem, app);
        const map = this.map;

        let meta = $A.base.loop(map, (key, params) => {
            let [domKey, defaultValue] = params;
            if (domKey === 'mapper') { return defaultValue; } // mapper set seperately
            return (domKey !== null) ? $A.base.parse($A.base.get(data, domKey, defaultValue)) : defaultValue;
        });

        if (meta.initialize === 'decoy') {
            return null; // component has yet to be formed
        }

        meta.mapper = this.captureMapperValues(data);

        if (!$A.base.empty(meta.trigger) && $A.base.empty(meta.componentString)){
            meta.componentString = meta.trigger;
            if ($A.base.empty(meta.id)) {
                meta.id = data.trigger + '-trigger';
            }
        }

        if (forSetup) {
            meta = await this.fixComponentData(meta);
            meta = this.validateComponentData(meta);
            if (meta === null) {
                return null;
            }
        }

        $A.state.dom.update(meta);
        return this.snapshots[meta.componentString];
    },

    captureMapperValues: function(data) {
        let mapper = {};
        $A.base.loop(data, (key, value) => {
            if (key.startsWith('stateMapper')) {
                let id = $A.base.lowercaseFirstLetter(key.slice(11));
                mapper[id] = $A.base.parse(value);
            }
        });
        return mapper;
    },


    /**
     * Makes full attempt at deciphering name, path and any identifiers 
     * found in meta data.
     * 
     * @param {str} meta 
     * @returns Returns {meta} | returns null and throws console errors on failiure
     */
    fixComponentData: async function (meta, elem) {
        const components = await $A.components(meta.app);
        let path = $A.base.get(meta, 'componentString', null);
        let id = $A.base.get(meta, 'id', null);

        if (path === null) {
            if (id !== null) {
                meta.componentString = id;
                path = id;
            } else {
                console.warn('State DOM Error: Component definition lacking any component identifier (i.e. id or data-state-component attributes).', meta);
                return null;
            }
        }

        if (id === null) {
            meta.id = meta.componentString;
            id = meta.componentString;
        }
        
        meta = this.decipherComponentName(path, meta);
        if (meta === null) { return null; }

        const pts2 = id.split('-');
        meta.containerId = pts2[0];
        meta.responseContainerId = meta.containerId + 'Response';
        meta.containerParts = pts2.slice(1).join('-');

        let component = await $A.state.get.component(meta);
        if (!component) { return null; }

        // re-confirm component** parts
        meta = this.decipherComponentName(component.name || path, meta);
        if (meta === null) { return null; }

        // confirm containerId's of all sorts exist in dom...
        let elem1 = $A.dom.obtainElementCorrectly(meta.containerId , false);
        let elem2 = $A.dom.obtainElementCorrectly(meta.responseContainerId , false);
        let elem3 = $A.dom.obtainElementCorrectly(meta.componentRoot, false);        
        if (elem1 === null && elem2 === null && elem3 === null) {
            console.warn("State Meta Capture Error: could not find containerId in DOM for meta: ", meta);
            return null;
        }

        if (meta.componentName !== meta.componentRoot) {
            // let's cover some edge cases for sub-components...
            if (elem1 === null && elem2 === null) {
                meta.containerId = meta.componentRoot;
                meta.responseContainerId = meta.componentRoot + 'Response';
            }
            if (elem1 !== null && elem2 === null && elem3 !== null) {
                meta.responseContainerId = meta.componentRoot + 'Response';
            }

            if (meta.containerId !== meta.componentName) {
                meta.type = 'orphan';
            } else {
                meta.type = 'child';
            }
        } else {
            meta.type = 'root';
        }
        return meta;
    },

    /**
     * parses 'path' into componentName|String|Root properties for meta.
     */
    decipherComponentName: function(path, meta) {
        if ($A.base.not(path, 'string')) { return meta; }
        const pts1 = path.split('.');
        if (pts1.length === 1) {
            meta.componentName = pts1[0];
            meta.componentString = pts1[0];
            meta.componentRoot = pts1[0];
        }
        if (pts1.length > 1) {
            meta.componentName = pts1[1];
            meta.componentString = `${pts1[0]}.${pts1[1]}`;
            meta.componentRoot = pts1[0];
        }
        if (pts1.length < 1 || pts1.length > 2) {
            console.warn('State Meta Capture Error: componentString must define upto 2 parts as string.', meta);
            meta = null;
        }
        return meta;
    },

    /**
     * Performs validation of data-state-* attributes and id=*.
     * Throws console warnings incase of errors.
     * 
     * @param {dict} meta: aka meta
     * @param {dom} elem 
     * @returns returns validated meta | null on failiures
     */
    validateComponentData: function(meta, elem) {
        if ($A.base.not(meta, 'dictionary')) {
            return null;
        }

        let app = $A.base.get(meta, 'app', null);
        const name = $A.base.get(meta, 'componentName', null);
        const path = $A.base.get(meta, 'componentString', null);
        const id = $A.base.get(meta, 'id', null);
        let initialize = $A.base.get(meta, 'initialize', null);
        let fromCache = $A.base.get(meta, 'fromCache', null);
        let tbls = $A.base.get(meta, 'tbls', null);

        if ($A.base.empty(app) || $A.base.not(app, 'string')) {
            console.warn('State Meta Capture Error: App name could not be found in DOM. validateComponentData()', meta, elem);
            return null;
        }

        if (name === null && path === null && id === null) {
            console.warn(`State Meta Capture Error: No component info can be found in DOM for element: `, meta, elem);
            return null;
        }
        
        if ($A.base.not(initialize, 'boolean') && initialize !== 'decoy') {
            console.warn('State Meta Capture Error: StateInitialize has to be enum of "true" | "false" | "decoy" in DOM elements: ', meta, elem);
            return null;
        }

        if ($A.base.not(fromCache, 'boolean')) {
            console.warn('State Meta Capture Error: fromCache has to be enum of "true" | "false" in DOM elements: ', meta, elem);
            return null;
        }

        if ($A.base.not(tbls, 'list')) {
            console.warn('State Meta Capture Error: Component did not specify valid data-state-tbl-keys in array form, in DOM element: ', meta, elem);
            return null;
        }

        return meta;
    },

    
    /**
     * Confirms all required mapper fields are available before calling state.trigger()
     * @param {dict} meta 
     * @returns bool
     */
    validateMapperFields: async function(meta) {
        let mapper = $A.base.get(meta, 'mapper', null);
        if ($A.base.not(mapper, 'dictionary')) {
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
            if ($A.base.is(arg, 'list')){
                [ key, type ] = arg;
            }
            let val = $A.base.get(mapper, key, null);
            if ($A.base.empty(val)) {
                valid = false;
                return valid;
            }
            let parsed = $A.base.parse(val);
            if (type !== null && $A.base.not(parsed, type)) {
                valid = false;
                return valid;
            }
        });
        console.log('|| Meta Validation result for ' + meta.componentString + ': ', valid, JSON.parse(JSON.stringify(meta)));
        return valid;
    },
}