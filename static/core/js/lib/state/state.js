import $A from "../../helper.js";
import dom from "./state-dom.js";
import meta from "./state-meta.js";
import events from "./state-events.js";
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

    /**
     * state.trigger() wrapper for manual component calls.
     * 
     * @param {str} componentString: path.toComponent in string format
     * @param {dict} mapper: key: value pairs to pass to comonent.fetch() call.
     * @param {dict} meta: carries compiled meta info on component.
     * @param {bool} fromCache: can we use cached data in this call?
     */
    call: async function(componentString, mapper = {}, meta = null, fromCache = true) {
        if ($A.base.not(componentString, 'string')) {
            console.warn(`State Error: Component String must be a valid string type.`, componentString, meta, newMapper);
            return null;
        }
        console.log('||4 initiating component: ', componentString, "{to be formed}");
        
        if ($A.base.empty(meta)) {
            meta = await $A.state.dom.generateMeta(componentString, true);
        }
        let result = await triggerState(componentString, mapper, meta, fromCache);
        $A.state.dom.dismantleComponent(meta);
        return result;
    },

    dom: dom,
    meta: meta,
    events: events,
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
            if (!component || component.name !== meta.componentString) { return null; }

            const componentName = meta.componentName;
            let identifiers = $A.base.get(component, 'identifier', []);
            let key = '';

            identifiers.forEach((id) => {
                if (!$A.base.empty(mapper[id])) {
                    key += mapper[id] + '-';
                }
            });

            if (!$A.base.empty(key)) {
                let page = $A.base.get(mapper, 'page', 1);
                key += 'p' + page;
                return componentName + '-' + key;
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
            if ($A.base.empty(meta) || !$A.base.get(meta, 'app')) {
                return null;
            }
            const components = await $A.components(meta.app);
            const mod = $A.base.get(components, meta.componentRoot, null);
            if (mod !== null) {
                if (meta.componentRoot === meta.componentName) {
                    return mod.default;
                }
                let result = null;
                $A.base.loop(mod, (key, component) => {
                    if (key === meta.componentName){
                        result = component;
                    }
                });
                if (result !== null) {
                    return result;
                }
            } else {
                // component meta isn't formed right, need for intensive measures to find component
                let result = null;
                $A.base.loop(components, (modKey, module) => {
                    if (result === null) {
                        if (modKey === meta.componentName){
                            result = module.default;
                            return;
                        } else {
                            $A.base.loop(module, (key, component) => {
                                if (key === meta.componentName){
                                    result = component;
                                    return;
                                }
                            });
                        }
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
        if ($A.base.empty($A.base.get(mapper, 'componentString', null))) {
            return null; // must be a non-component fetch...
        }

        const meta = await $A.state.dom.generateMeta(mapper.componentString, 'forMeta');

        if ($A.base.empty(meta)) {
            console.warn('State Error: saveToCache() could not parse meta for: ' + mapper.componentString, containerId, mapper, data);
            return null;
        }

        const component = await $A.state.get.component(meta);
        if (component === null) { 
            console.warn('State Error: saveToCache() could not determine component: ', containerId, meta, mapper, data, component);
            return null; 
        }
        
        meta.identifier = $A.state.get.identifier(component, mapper,  meta);
        const cache = $A.base.get(component, 'cache', true);

        if (stateMemory.has(meta.identifier) && cache) {
            const rec = stateMemory.get(meta.identifier);
            const { componentString, ...newMapper } = mapper;
            rec.data = data;
            rec.mapper = newMapper;
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
    resetData: async function (mapper, providedMeta) {
        meta = await $A.state.dom.generateMeta(providedMeta.componentString, 'forMeta');
        const component = await $A.state.get.component(meta);
        
        if ($A.base.not(meta, 'dictionary') || $A.base.not(component, 'dictionary')) {
            console.warn(`State Error: Cannot reset data for component: ${$A.base.get(providedMeta, 'componentString', '#Error')}, no meta/component found: `, meta, component, {providedMeta: providedMeta});
            return null;
        }

        meta.identifier = $A.state.get.identifier(component, mapper,  meta);        
        const cache = $A.base.get(component, 'cache', true);

        if (stateMemory.has(meta.identifier) && cache) {
            const rec = stateMemory.get(meta.identifier);
            rec.data = null;
            rec.timestamp = Date.now();
            //stateMemory.set(meta.identifier, rec); @todo, confirm state has been updated
        }
    },
};



/**
 * Determines provided componnet and attempts to trigger its execution.
 * 
 * @param {str} componentString: path.toComponent in string format
 * @param {dict} mapper: key: value pairs to pass to comonent.fetch() call.
 * @param {dict} meta: carries compiled meta info on component.
 * @param {bool} fromCache: can we use cached data in this call?
 */
async function triggerState(componentString, newMapper = {}, meta = null, fromCache = true) {
    if ($A.base.not(componentString, 'string')) {
        console.warn(`State Error: Component String must be a valid string type.`, componentString, meta, newMapper);
        return null;
    }
    if ($A.base.empty(meta)) {
        meta = await $A.state.dom.generateMeta(componentString);
    }

    if ($A.base.not(meta, 'dictionary')) {
        console.warn(`State Error: Failed to trigger component: ${componentString}, no meta found.`, componentString, meta, newMapper);
        return null;
    }

    const component = await $A.state.get.component(meta);
    if (!component) { return null; }
    
    // components with cache = false don't have states, will skip some processes..
    const cache = $A.base.get(component, 'cache', true);
    meta.mapper = $A.base.merge(meta.mapper, newMapper);

    if (cache) {
        meta.identifier = $A.state.get.identifier(component, newMapper,  meta);
        if (!stateMemory.has(meta.identifier)) {
            createRecord(component, newMapper, meta);
        }
    }
    
    $A.state.dom.cleanComponentDom(meta);
    
    let oldMapper = null;
    if (cache) {
        const stateData = stateMemory.get(meta.identifier);
        oldMapper = stateData.mapper;

        if (fromCache) {
            const result = $A.state.crud.readFromCache(component, stateData, cacheTime);
            if (result !== 'failed.CacheLoad') {
                meta.mapper = oldMapper;
                $A.state.dom.update(meta);
                $A.app.runBasicSetupOperations(meta.containerId);
                return result;
            }
        }
    }

    let args;
    if ($A.base.is(oldMapper, 'dictionary') && $A.base.is(meta.mapper, 'dictionary')) {
        args = $A.base.merge(oldMapper, meta.mapper)
        const page = $A.base.get(args, 'page', 1);
        args['page'] = $A.base.is(page, 'number') ? page : 1;
    } else {
        args = newMapper;
    }

    if ($A.base.not(component.component, 'function')) {
        throw new Error(`State Error: Component "${meta.componentString}".component() not found."`);
    }

    meta.mapper = args;
    $A.state.dom.update(meta);

    if ($A.base.not(component.fetch, 'function')) {
        // basic fetch call..
        return await component.component({}, meta.responseContainerId, args);
    } else {
        return component.fetch(args, meta.responseContainerId);
    }
}



/**
 * Helper function.
 * Creates actual state record based on prpovided parameters. Used internally.
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
        console.error(`State Error: State update failed for key: "${meta.identifier}"`, error);
        throw error;
    }


    /**
     * Parses the state key into its four components.
     * @param {string} key - Unique key in string form that identifies one fetch 'state' for recurring triggering
     * @param {string} configString - configurations: 'app.tblKey.uniqueContainerIdentifier'
     * @returns {object} - { app, containerId, componentFunctionName }
     */
    function parseMeta(component, meta) {
        let app = $A.base.get(meta, 'app', null);
        let tbls = $A.base.get(meta, 'tbls', null) || (component ? component.tbls : []);
        let componentName = $A.base.get(meta, 'componentName', null);
        let componentString = $A.base.get(meta, 'componentString', null);
        let containerId = $A.base.get(meta, 'containerId', null);
        let responseContainerId = $A.base.get(meta, 'responseContainerId', null);

        if (!app) {
            app = $A.state.dom.getAppFromDom();
        }

        if ($A.base.is(tbls, 'string')) {
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
        if ($A.base.is(tblKeys, 'string')) {
            const tbl = tblKeys;
            let registry = $A.base.get(tblAndStateKeys, tbl, []);
            registry.push(stateKey);
            tblAndStateKeys[tbl] = registry;
            return null;
        }

        if ($A.base.is(tblKeys, 'list')) {
            tblKeys.forEach((tbl) => {
                let registry = $A.base.get(tblAndStateKeys, tbl, []);
                registry.push(stateKey);
                tblAndStateKeys[tbl] = registry;
            });
            return null;
        }

        throw Error('State Error: Could not identify tbl-keys in setStateKeyForTable: ' + $A.base.stringify(tblKeys));
    }
}
