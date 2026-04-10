import $A from "../helper.js";
import dom from "../helpers/state-dom.js";
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
         * @param {*} component: executibe component code block derived from $A.components
         * @param {*} mapper: dict of args passed to satte lib
         * @param {*} meta: additional data about component
         * @returns string
         */
        identifier: function (component, mapper, meta) {
            const componentName = meta.componentName;
            let key = '';
            component.identifier.forEach((id) => {
                if (!$A.generic.isVariableEmpty(mapper[id])) {
                    key += mapper[id] + '.';
                }
            });
            return componentName + '.' + key.slice(0, -1);
        },

        containerId: function (componentString, componentName) {
            const container = $A.dom.obtainElementCorrectly(componentName, false);
            if (container === null) {
                let parts = componentString.split('.');
                parentName = parts[0];
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
         * Returns componentName for given valid statekey
         * @param {str} stateKey 
         */
        componentName: function (stateKey) {
            if (!stateMemory.has(stateKey)) {
                throw new Error(`State Error: No state found for key: "${stateKey}" in getComponentName().`);
            }
            const stateData = stateMemory.get(stateKey);
            return stateData.componentName;
        },

        /**
         * Fetches component (executable) for provided component.
         * 
         * @param {str} componentName: mainComponentName.subcomponentName (default comp. does not need default elaboration)
         * @param {dict} meta: additional data on component 
         * @returns array [componentName, component]
         */
        component: function (componentName, meta) {
            if ($A.generic.isVariableEmpty(componentName) || $A.generic.checkVariableType(componentName) !== 'string') {
                console.warn('State Error: Component name not in string format: ' + componentName, meta);
                throw Error('State Error: Component name not in string format or empty string: ' + componentName);
            }

            const parts = componentName.split('.');
            const mod = $A.generic.getter($A.components, parts[0], null);
            if (mod !== null) {
                if (parts.length === 1) {
                    return [parts[0], $A.components[parts[0]].default];
                }
                if (parts.length === 2) {
                    $A.generic.loopObject(mod, (key, component) => {
                        if (key === parts[1]){
                            return [parts[0][key], $A.components[parts[0]][key]];
                        }
                    });
                }
            }
            console.warn('State Error: Could not find component: ' + componentName, meta);
            throw Error('State Error: Could not find component: ' + componentName);
        },
    },

    /**
    * Updates cache with fresh data. Called in Fetcher().
    * @param {str} containerId 
    * @param {dict} data 
    */
    saveToCache: function (containerId, data, mapper = {}) {
        if ($A.generic.getter(mapper, 'componentString', null) === null) {
            throw Error('State Error: saveToCache() needs "componentString" property set to path of component in passed mapper.');
        }

        const container = $A.dom.containerElement(containerId);
        const meta = $A.state.dom.captureComponentData(container);

        const [componentName, component] = $A.state.get.component(mapper.componentString, meta);
        meta.componentName = componentName;
        meta.identifier = $A.state.get.identifier(component, newMapper,  meta);
                
        if (stateMemory.has(meta.identifier)) {
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
                
        if (stateMemory.has(meta.identifier)) {
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
function triggerState(componentString, newMapper = {}, meta, fromCache = true) {
    if (typeMapper !== 'dictionary') {
        throw Error(`State Error: State mapper argument should be an Object. Received: ${$A.generic.checkVariableType(mapper)}.`);
    }

    const [componentName, component] = $A.state.get.component(componentString, meta);
    meta.componentName = componentName;
    meta.identifier = $A.state.get.identifier(component, newMapper,  meta);

    if (!stateMemory.has(meta.identifier)) {
        createRecord(component, newMapper, meta);
    }

    const elem = $A.dom.searchElementCorrectly(meta.id);
    elem.dataset.stateInitialize = true;

    try {
        const stateData = stateMemory.get(meta.identifier);
        const { app, mapper, containerId,  componentName, componentString, data, timestamp } = stateData;
        
        if (fromCache) {
            const result = $A.state.crud.readFromCache(data, timestamp, cacheTime, stateData);
            if (result === true) {
                console.log('We HAVE called component from Cache:', containerId);
                return result;
            }
        }

        let args = $A.generic.merge(mapper, newMapper)
        const page = $A.generic.getter(args, 'page', 1);
        args['page'] = $A.generic.checkVariableType(page) === 'number' ? page : 1;

        if ($A.generic.checkVariableType(component.fetch) !== 'function') {
            throw new Error(`State Trigger Error: Function "${meta.componentString}" not found in fetch module for app: "${meta.app}"`);
        }

        // Call the fetch function with the stored args
        return component.fetch(args, containerId);
        
    } catch (error) {
        console.error(`State Error: State trigger failed for key: "${key}"`, error);
        throw error;
    }
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
            let registry = $A.generic.getter(tblAndStateKeys, 'tbl', []);
            registry.push(stateKey);
            tblAndStateKeys[tbl] = registry;
            return null;
        }

        if ($A.generic.checkVariableType(tblKeys) === 'list') {
            tblKeys.forEach((tbl) => {
                let registry = $A.generic.getter(tblAndStateKeys, 'tbl', []);
                registry.push(stateKey);
                tblAndStateKeys[tbl] = registry;
            });
            return null;
        }

        throw Error('State Error: Could not identify tbl-keys in setStateKeyForTable: ' + $A.generic.stringify(tblKeys));
    }
}
