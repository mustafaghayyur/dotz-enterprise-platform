import $A from "../helper.js";
import dom from "./state-dom.js";
import crud from "./state-crud.js";

const stateMemory = new Map(); // Internal state memory holds all state objects
const tblAndStateKeys = {}; // holds registtry of all tbls andany State-Keys associated with it
const cacheTime = 1000 * 60 * 15; // cache time

/**
 * State Manager
 * Allows fetched data to be stored in memory.
 * All components can conveniently be auto-triggered with data-state-initialize attributes.
 * Manages state/cache updates when C.U.D. operations are done.
 */
export default {
    trigger: triggerState,
    call: triggerState, // alias
    dom: dom,
    crud: crud,

    /**
     * getter functions to access internal State memory
     */
    get: {
        /**
         * generates unique Key for record of component, based on 
         * component.identifier and mapper args.
         * 
         * @param {*} component: executable component code block from $A.components()
         * @param {*} mapper: dict of args passed to state lib
         * @param {*} meta: dom-data about component
         * @returns string
         */
        identifier: function (component, mapper, meta) {
            const componentName = meta.componentName;
            let identifiers = $A.generic.getter(component, 'identifier', []);
            let key = '';

            identifiers.forEach((id) => {
                if (!$A.generic.isVariableEmpty(mapper[id])) {
                    key += mapper[id] + '.';
                }
            });

            if (!$A.generic.isVariableEmpty(key)) {
                return componentName + '.' + key.slice(0, -1);
            }
            return componentName;
        },

        /**
         * Returns state-keys-list for provided table.
         * @param {str} tbl 
         * @returns []
         */
        allStatesKeysForTable: function (tbl) {
            return tblAndStateKeys[tbl];
        },

        /**
         * Returns record for key.
         * @param {str} key 
         * @returns 
         */
        record: function(key) {
            return stateMemory.get(key);
        },


        /**
         * Fetches component (executable) for provided component.
         * 
         * @param {dict} meta: data object for component 
         * @returns component | null on error
         */
        component: async function (meta) {            
            const components = await $A.components(meta.app);
            const mod = $A.generic.getter(components, meta.componentRoot, null);
            if (mod !== null) {
                if (meta.componentRoot === meta.componentName) {
                    return mod.default;
                }
                let result = null;
                $A.generic.loopObject(mod, (key, component) => {
                    if (key === meta.componentName){
                        result = component;
                    }
                });
                if (result !== null) {
                    return result;
                }
            }
            console.warn('State Error: Could not find component: ' + meta, mod);
            return null;
        },
    },

    /**
    * Updates cache with fresh data. Called in Fetcher().
    * @param {str} containerId 
    * @param {dict} data 
    * @param {dict} mapper 
    */
    saveToCache: async function (containerId, data, mapper = {}) {
        if ($A.generic.getter(mapper, 'componentString', null) === null) {
            console.warn('State Error: saveToCache() needs "componentString" property set to path of component in passed mapper. ', containerId, data, mapper);
            return null;
        }

        const container = $A.dom.containerElement(containerId);
        const meta = await $A.state.dom.captureComponentData(container);

        const component = await $A.state.get.component(meta);
        meta.identifier = $A.state.get.identifier(component, mapper,  meta);
        const cache = $A.generic.getter(component, 'cache', true);

        if (stateMemory.has(meta.identifier) && cache) {
            const rec = stateMemory.get(meta.identifier);
            rec.data = data;
            rec.timestamp = Date.now();
            //stateMemory.set(meta.identifier, rec); @todo, confirm state has been updated
        }
    },

    /**
     * Empties the 'data' store for component state instance.
     * @param {str} componentString 
     * @param {dict} mapper 
     * @param {dict} meta 
     */
    resetData: async function (mapper, meta) {
        const component = await $A.state.get.component(meta);
        meta.identifier = $A.state.get.identifier(component, mapper,  meta);        
        const cache = $A.generic.getter(component, 'cache', true);

        if (stateMemory.has(meta.identifier) && cache) {
            const rec = stateMemory.get(meta.identifier);
            rec.data = null;
            rec.timestamp = Date.now();
            //stateMemory.set(meta.identifier, rec); @todo, confirm state has been updated
        }
    },
};



/**
 * Triggers a previously stored state by its key.
 * This executes the fetch function with the args that were stored when save() was called.
 * 
 * @param {string} key - The unique key for the state (first part of the state key)
 * @param {obj} mapper - Updated mapper for this trigger call only. Overwrites save() mapper.
 */
async function triggerState(componentString, newMapper = {}, meta = null, fromCache = true) {
    if ($A.generic.checkVariableType(componentString) !== 'string') {
        console.warn(`State Error: Component String must be a valid string type.`, componentString, meta, newMapper);
        return null;
    }
    meta = await $A.state.dom.validateMeta(componentString, meta);

    console.log('MG - inspect meta', componentString, meta);
    const component = await $A.state.get.component(meta);
    
    // components with cache = false don't have states, will skip some processes..
    const cache = $A.generic.getter(component, 'cache', true);

    if (cache) {
        meta.identifier = $A.state.get.identifier(component, newMapper,  meta);

        let orgnTbls = component.tbls;
        if ($A.generic.checkVariableType(orgnTbls) === 'list' && $A.generic.checkVariableType(meta.tbls) === 'list') {
            meta.tbls = [...new Set([...orgnTbls, ...meta.tbls])];
        }

        if (!stateMemory.has(meta.identifier)) {
            createRecord(component, newMapper, meta);
        }
    }
    
    const elem = $A.dom.obtainElementCorrectly(meta.id, false);
    if (elem) { elem.dataset.stateInitialize = true; }
    
    let oldMapper = null;
    let fetchContainerId = meta.responseContainerId;

    if (cache) {
        const stateData = stateMemory.get(meta.identifier);
        oldMapper = stateData.mapper;
        fetchContainerId = stateData.responseContainerId;

        if (fromCache) {
            const result = $A.state.crud.readFromCache(component, stateData, cacheTime);
            if (result === true) {
                return result;
            }
        }
    }

    let args;
    if ($A.generic.checkVariableType(oldMapper) === 'dictionary' && $A.generic.checkVariableType(newMapper) === 'dictionary') {
        args = $A.generic.merge(oldMapper, newMapper)
        const page = $A.generic.getter(args, 'page', 1);
        args['page'] = $A.generic.checkVariableType(page) === 'number' ? page : 1;
    } else {
        args = newMapper;
    }

    if ($A.generic.checkVariableType(component.fetch) !== 'function') {
        throw new Error(`State Error: Function "${meta.componentString}" not found in fetch module for app: "${meta.app}"`);
    }

    // Call the fetch function with the stored args
    return component.fetch(args, fetchContainerId);
}



/**
 * Updates the state with fetch function and its arguments, within 
 * in-memory storage for later retrieval via triggerState().
 * 
 * @param {string} component - Unique component identifer
 * @param {obj} mapper - Dictionary of key => val pairs used as arguments passed to the fetch function
 * @param {obj} meta - additional configurations often passed by dom attributes
 * @returns {Promise<void>}
 */
async function createRecord(component, mapper = {}, meta = {}) {
    try {
        const { app, tbls, containerId, responseContainerId, componentName, componentString } = parseMeta(component, meta);

        setStateKeyForTable(tbls, meta.identifier);

        // store in memory with short-hand for key:value pairs...
        stateMemory.set(meta.identifier, {
            app,
            mapper,
            containerId,
            responseContainerId,
            componentName,
            componentString,
            data: null,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error(`State Error: State update failed for key: "${key}"`, error);
        throw error;
    }


    /**
     * Parses the state key into its four components.
     * @param {string} key - Unique key in string form that identifies one fetch 'state' for recurring triggering
     * @param {string} configString - configurations: 'app.tblKey.uniqueContainerIdentifier'
     * @returns {object} - { app, containerId, componentFunctionName }
     */
    function parseMeta(component, meta) {
        let app = $A.generic.getter(meta, 'app', null);
        let tbls = $A.generic.getter(meta, 'tbls', null);
        let componentName = $A.generic.getter(meta, 'componentName', null);
        let componentString = $A.generic.getter(meta, 'componentString', null);
        let containerId = $A.generic.getter(meta, 'containerId', null);
        let responseContainerId = $A.generic.getter(meta, 'responseContainerId', null);

        if (!app) {
            app = $A.state.dom.getAppFromDom();
        }

        if (!tbls) {
            tbls = component.tbls;
        }

        if (!$A.generic.checkVariableType(tbls) === 'string') {
            tbls = tbls.split('|');
        }

        if (!componentString) {
            componentString = component.name;
        }

        if (!app || !tbls || !containerId || !responseContainerId || !componentName || !componentString) {
            console.error(`State Error: Cannot determine all required configuraton parts for component: "${componentName}-${identifier}".`, meta);
            throw new Error(`State Error: Cannot determine all required configuraton parts for component: "${componentName}-${identifier}".`);
        }
        
        return { app, tbls, containerId, responseContainerId, componentName, componentString };
    }

    

    /**
     * Adds provided state-key to provided table-key's list
     * 
     * @param {str} tblKeys 
     * @param {str} stateKey 
     * @returns null
     */
    function setStateKeyForTable(tblKeys, stateKey) {
        if ($A.generic.checkVariableType(tblKeys) === 'string') {
            const tbl = tblKeys;
            let registry = $A.generic.getter(tblAndStateKeys, tbl, []);
            registry.push(stateKey);
            tblAndStateKeys[tbl] = registry;
            return null;
        }

        if ($A.generic.checkVariableType(tblKeys) === 'list') {
            tblKeys.forEach((tbl) => {
                let registry = $A.generic.getter(tblAndStateKeys, tbl, []);
                registry.push(stateKey);
                tblAndStateKeys[tbl] = registry;
            });
            return null;
        }

        throw Error('State Error: Could not identify tbl-keys in setStateKeyForTable: ' + $A.generic.stringify(tblKeys));
    }
}
