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
         * generates unique Key for record give component, and other items
         * @param {*} component: executibe component code block derived from $A.{app}.components
         * @param {*} mapper: dict of args passed to satte lib
         * @param {*} meta: additional data about component
         * @returns string
         */
        identifier: function (component, mapper, meta) {
            const componentName = meta.componentName;
            let ids = $A.generic.getter(component, 'identifier', []);
            let key = '';
            ids.forEach((id) => {
                if (!$A.generic.isVariableEmpty(mapper[id])) {
                    key += mapper[id] + '.';
                }
            });

            if (!$A.generic.isVariableEmpty(key)) {
                return componentName + '.' + key.slice(0, -1);
            }
            return componentName;
        },

        containerId: function (componentString, componentName) {
            let container = $A.dom.obtainElementCorrectly(componentName, false);
            if (container === null) {
                let parts = componentString.split('.');
                const parentName = parts[0];
                container = $A.dom.obtainElementCorrectly(parentName, false);

                if (container === null) {
                    throw Error ('State Error: Could not obtain containerId for component: ' + componentString);
                }
            }
            return container.id;
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
         * Makes full attempt at deciphering both name and path of component.
         * 
         * @param {str} meta 
         * @returns Returns {obj.name, obj.path} | throws error on failiure
         */
        componentName: async function (meta) {
            if ($A.generic.checkVariableType(meta) !== 'dictionary') {
                throw new Error(`State Error: The provided meta to $A.state.get.componentName() is not a valid dictionary.`);
            }
            const components = await $A.components();
            if ($A.generic.getter(meta, 'componentName', null) === null) {
                if ($A.generic.getter(meta, 'componentString', null) === null) {
                    let id = $A.generic.getter(meta, id);
                    if ($A.generic.isVariableEmpty(id)) {
                        throw new Error(`State Error: No component can be found in meta for $A.state.get.componentName().`);
                    }
                    if ($A.generic.getter(components, id, null) === null) {
                        components.forEach((comp) => {
                            if ($A.generic.getter(comp, id, null) !== null) {
                                return {
                                    name: comp[id].name,
                                    path: `${id}.comp[id].name`,
                                }
                            }
                        });
                        return null;
                    } else {
                        return {
                            name: id,
                            path: id,
                        }
                    }
                } else {
                    let parts = meta.componentString.split('.');
                    if (parts.length > 1) {
                        return {
                            name: parts[1],
                            path: meta.componentString,
                        }
                    } else {
                        return {
                            name: parts[0],
                            path: meta.componentString,
                        }
                    }
                }
            } else {
                let parts = meta.componentName.split('.');
                if (parts.length > 1) {
                    return {
                        name: parts[1],
                        path: meta.componentName,
                    }
                } else {
                    if ($A.generic.getter(components, componentName, null) === null) {
                        components.forEach((comp) => {
                            if ($A.generic.getter(comp, id, null) !== null) {
                                return {
                                    name: comp[id].name,
                                    path: `${id}.comp[id].name`,
                                }
                            }
                        });
                    } else {
                        return {
                            name: parts[0],
                            path: meta.componentName,
                        }
                    }
                }
            }
            console.warn('State Error: Could not determine component for operation.', meta);
            throw Error ('State Error: Could not determine component for operation.');
        },

        /**
         * Fetches component (executable) for provided component.
         * 
         * @param {str} componentString: mainComponentName.subcomponentName (default comp. does not need default elaboration)
         * @param {dict} meta: additional data on component 
         * @returns array [componentName, component]
         */
        component: async function (componentString, meta) {
            if ($A.generic.isVariableEmpty(componentString) || $A.generic.checkVariableType(componentString) !== 'string') {
                let { componentName, path } = await $A.state.get.componentName(meta);
                componentString = path;
                meta.componentName = componentName;
            }

            const parts = componentString.split('.');
            const components = await $A.components();
            const mod = $A.generic.getter(components, parts[0], null);
            if (mod !== null) {
                if (parts.length === 1) {
                    return [parts[0], mod.default];
                }
                if (parts.length === 2) {
                    let found = null;
                    $A.generic.loopObject(mod, (key, component) => {
                        if (key === parts[1]){
                            found = [key, component];
                        }
                    });
                    if (found) return found;
                }
            }
            console.warn('State Error: Could not find component: ' + componentString, meta, mod, parts[0]);
            return [null, null];
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
        const meta = $A.state.dom.captureComponentData(container);

        const [componentName, component] = await $A.state.get.component(mapper.componentString, meta);
        meta.componentName = componentName;
        meta.identifier = $A.state.get.identifier(component, mapper,  meta);
        const cache = $A.generic.getter(component, 'cache', true);

        if (stateMemory.has(meta.identifier) && cache) {
            console.log('saveToCache(): ', meta.identifier, stateMemory.has(meta.identifier), container, data);
            const rec = stateMemory.get(meta.identifier);
            rec.data = data;
            rec.timestamp = Date.now();
            //stateMemory.set(meta.identifier, rec); @todo, confirm state has been updated
            console.log('SaveToCache: Here is what the new cache looks like: ', stateMemory.get(meta.identifier));
        }
    },

    /**
     * Empties the 'data' store for component state instance.
     * @param {str} componentString 
     * @param {dict} mapper 
     * @param {dict} meta 
     */
    resetData: function (componentString, mapper, meta) {
        const [componentName, component] = $A.state.get.component(componentString, meta);
        meta.componentName = componentName;
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
    const [componentName, component] = await $A.state.get.component(componentString, meta);
    
    if ($A.generic.checkVariableType(component) !== 'dictionary') {
        console.warn(`State Error: Could not find component for: "${componentString}".`, meta, newMapper);
        return null;
    }

    if ($A.generic.checkVariableType(meta) !== 'dictionary') {
        let elemTmp = $A.dom.obtainElementCorrectly(componentName, false);
        if (elemTmp === null) {
            const parentName = componentString.split('.')[0];
            console.log('MG - inspect if the parentName in state.trigger() is correct: ', parentName);
            elemTmp = $A.dom.obtainElementCorrectly(parentName);
        }
        meta = $A.state.dom.captureComponentData(elemTmp);
    }

    // components with cache = false don't have states, will skip some processes..
    const cache = $A.generic.getter(component, 'cache', true);
    meta.componentName = componentName;

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
    
    const elem = $A.dom.obtainElementCorrectly(meta.id);
    elem.dataset.stateInitialize = true;
    let mapper = null;
    let responseContainerId = $A.state.get.containerId(meta.componentString, meta.componentName) + 'Response';
``

    if (cache) {
        const stateData = stateMemory.get(meta.identifier);
        let { app, mapper, containerId, responseContainerId, componentName, componentString, data, timestamp } = stateData;

        if (fromCache) {
            const result = $A.state.crud.readFromCache(component, stateData, cacheTime);
            if (result === true) {
                console.log('We HAVE called component from Cache:', containerId);
                return result;
            }
        }
    }

    let args;
    if (typeof mapper !== 'undefined' && $A.generic.checkVariableType(mapper) === 'dictionary' && $A.generic.checkVariableType(newMapper) === 'dictionary') {
        let oldMapper = (mapper) ? mapper : {};
        args = $A.generic.merge(oldMapper, newMapper)
        const page = $A.generic.getter(args, 'page', 1);
        args['page'] = $A.generic.checkVariableType(page) === 'number' ? page : 1;
    } else {
        args = newMapper;
    }

    if ($A.generic.checkVariableType(component.fetch) !== 'function') {
        throw new Error(`State Trigger Error: Function "${meta.componentString}" not found in fetch module for app: "${meta.app}"`);
    }

    // Call the fetch function with the stored args
    return component.fetch(args, responseContainerId);
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

        if (!componentName) {
            let parts = componentString.split('.');
            componentName = parts[1];
        }

        if (!containerId) {
            containerId = $A.state.get.containerId(componentString, componentName);
            responseContainerId = containerId + 'Response';
        }

        if (!app || !tbls || !containerId || !responseContainerId || !componentName || !componentString) {
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
