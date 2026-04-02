import $A from "../helper.js";
import dom from "../helpers/stateDom.js";
import crud from "./state-crud.js";

// Registry to cache loaded fetch modules to avoid repeated imports
const fetchModuleRegistry = {};
// Internal state memory holds all state objects
const stateMemory = new Map();
// holds registtry of all tbls andany State-Keys associated with it
const tblAndStateKeys = {};
const cacheTime = 1000 * 60 * 15;

/**
 * State Manager
 * Unline ReactJs' key=>value pairing, our state stores fetch functions
 * defined in static/{app}/js/crud/fetch*.js files. Custom mapers can be passed 
 * through both save() and trigger() calls allowing some level of versatility.
 */
export default {
    /**
     * save(key, 'appName.tblKey.uniqueContainerIdentifier', mapperOfArguments)
     * Stores in state fetch function call.
     */
    save: updateState,

    /**
     * trigger('stateKey', newMapper)
     * Executes the fetch function with previously stored args (and new ones) for that key.
     */
    trigger: triggerState,

    /**
     * dom helper functions that relate to state management within dom
     */
    dom: dom,

    /**
     * State Crud Operations
     */
    crud: crud,

    /**
     * getter functions to access internal State memory
     */
    get: {
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
        }
    },
    /**
     * Memmory management function
     */
    clearModuleCache: () => { 
        Object.keys(fetchModuleRegistry).forEach(key => delete fetchModuleRegistry[key]); 
    },

    saveToCache: saveToCache,
};

/**
 * Updates the state with fetch function and its arguments, within 
 * in-memory storage for later retrieval via triggerState().
 * 
 * @param {string} key - The state key
 * @param {string} configString - configurations: 'appName.tblKey.uniqueContainerIdentifier'
 * @param {obj} mapper - Dictionary of key => val pairs used as arguments passed to the fetch function
 * @returns {Promise<void>}
 */
async function updateState(key, configString, mapper = {}, fetchFile = 'Default') {
    const typeKey = $A.generic.checkVariableType(key);
    if (typeKey !== 'string') {
        throw Error(`State Save Error: State key argument should be a string. Received: ${typeKey}. Raw: ${key}`);
    }
    
    const typeMapper = $A.generic.checkVariableType(mapper);
    if (typeMapper !== 'dictionary') {
        throw Error(`State Error: State mapper argument should be an Object. Received: ${typeMapper}.`);
    }
    
    try {
        const { appName, tblKeys, containerId,  componentName, componentPath } = parseConfigString(key, configString);
        const fetchFunctionFullName = await findFetchComponent(componentName, appName, fetchFile);
        
        setStateKeyForTable(tblKeys, key);

        // store in memory with short-hand for key:value pairs...
        stateMemory.set(key, {
            appName,
            mapper,
            containerId,
            componentName,
            componentPath,
            fetchFunctionFullName,
            fetchFile,
            data: [],
            timestamp: Date.now()
        });
    } catch (error) {
        console.error(`State Error: State update failed for key: "${key}"`, error);
        throw error;
    }


    /**
     * Parses the state key into its four components.
     * @param {string} key - Unique key in string form that identifies one fetch 'state' for recurring triggering
     * @param {string} configString - configurations: 'appName.tblKey.uniqueContainerIdentifier'
     * @returns {object} - { appName, containerId, componentFunctionName }
     */
    function parseConfigString(key, configString) {
        const parts = configString.split('.');
        if (parts.length !== 3) {
            throw new Error(`State Error: Invalid state key format: "${configString}". Expected format: "appName.tblKey.uniqueContainerIdentifier"`);
        }
        
        const [appName, tblKeysString, componentNameString] = parts;

        const tblKeys = tblKeysString.split('|');
        if ($A.generic.checkVariableType(tblKeys) !== 'list') {
            console.error('State Update Error: Table-keys for component could not be parsed as list.', key, componentName, tblKeysString);
            throw Error('State Update Error: Table-keys for component could not be parsed as list.');
        }

        const [componentName, componentPath] = $A.state.dom.extractComponentName(componentNameString);
        const containerId = `${componentName}Response`;
        
        if (!appName || !tblKeys ||  !containerId || !componentName || !componentPath) {
            throw new Error(`State Error: Cannot determine all required configuraton parts for key: "${key}". String provided: "${configString}"`);
        }
        
        return { appName, tblKeys, containerId, componentName, componentPath };
    }

    /**
     * Searches and stores in-memory, the fetch function component using fetchFile specified.
     * @param {*} componentName: fetch function shorthand 
     * @param {*} appName: current app/module/space 
     * @param {*} fetchFile: defauls to 'Default' suffix for fetch-file.
     * @returns fetchFunctionFullName
     */
    async function findFetchComponent(componentName, appName, fetchFile) {
        const functionName = 'fetch' + componentName.charAt(0).toUpperCase() + componentName.slice(1);
        try {
            if (!fetchModuleRegistry[fetchFile]) {
                fetchModuleRegistry[fetchFile] = await $A.app.loadFetchModule(appName, fetchFile);
            }
            const func = fetchModuleRegistry[fetchFile][functionName];
        } catch (error) {
            throw Error('State Error: Could not import fetch component: ' + fetchFile + '.' + functionName + '. ' + error.message);
        }
        return functionName;
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

/**
 * Triggers a previously stored state by its key.
 * This executes the fetch function with the args that were stored when save() was called.
 * 
 * @param {string} key - The unique key for the state (first part of the state key)
 * @param {obj} mapper - Updated mapper for this trigger call only. Overwrites save() mapper.
 */
function triggerState(key, newMapper = {}, cache = true) {
    if (!stateMemory.has(key)) {
        throw new Error(`State Trigger Error: No state found for key: "${key}". Call updateState() first to initialize this state.`);
    }
    try {
        const stateData = stateMemory.get(key);
        const { appName, mapper, containerId,  componentName, componentPath, fetchFunctionFullName, fetchFile, data, timestamp } = stateData;
        
        if (cache) {
            const result = $A.state.crud.readFromCache(data, timestamp, cacheTime, stateData);
            if (result === true) {
                console.log('We HAVE called component from Cache:', containerId);
                return result;
            }
        }

        let args = $A.generic.merge(mapper, newMapper)
        const page = $A.generic.getter(args, 'page', 1);
        args['page'] = $A.generic.checkVariableType(page) === 'number' ? page : 1;

        const fetchFunction = getFetchComponent(fetchFunctionFullName, fetchFile);
        if ($A.generic.checkVariableType(fetchFunction) !== 'function') {
            throw new Error(`State Trigger Error: Function "${fetchFunctionFullName}" not found in fetch module for app: "${appName}"`);
        }

        // Call the fetch function with the stored args
        return fetchFunction(args, containerId, componentPath);
        
    } catch (error) {
        console.error(`State Error: State trigger failed for key: "${key}"`, error);
        throw error;
    }


    /**
     * Returns fetchFunction module component from memory.
     * 
     * @param {*} functionName: proper fetchFunction name
     * @param {*} fileName: file the function component resides in (default is 'Default')
     * @returns 
     */
    function getFetchComponent(functionName, fileName) {
        try {
            return fetchModuleRegistry[fileName][functionName];
        } catch (error) {
            throw Error('State Error: Could not find fetch component: ' + fileName + '.' + functionName + '. ' + error.message);
        }
        
    }
}

function saveToCache (containerId, data) {
    const container = $A.dom.containerElement(containerId);
    const meta = $A.state.dom.captureComponentData(container);
    const stateKey = $A.generic.getter(meta, 'key', false);
    console.log('saveToCache(): ', container, stateKey, data, stateMemory.has(stateKey));
    if (stateKey && stateMemory.has(stateKey)) {
        const stateData = stateMemory.get(stateKey);
        stateData.data = data;
        stateData.timestamp = Date.now();
        stateMemory.set(stateKey, stateData);
        console.log('SaveToCache: Here is what the new cache looks like: ', stateMemory.get(stateKey));
    }
}