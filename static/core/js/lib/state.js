import $A from "../helper.js";

/**
 * Our own Redux/State Manager
 * Not as sophisticated as ReactJS, but serves the purpose.
 */

// Registry to cache loaded fetch modules to avoid repeated imports
const fetchModuleRegistry = {};

// Internal state memory to persist key/args pairs during session (single session, no localStorage)
const stateMemory = new Map();

/**
 * Formulates valid function Name, loads function module file, 
 * and returns requested function component.
 * 
 * @param {*} funcName: short-hand function name (without 'fetch' prefix)
 * @param {*} fileName: file the function component resides in (default is 'Default')
 * @returns 
 */
async function fetchComponent(funcName, appName, fileName) {
    const functionName = 'fetch' + funcName.charAt(0).toUpperCase() + funcName.slice(1);
    if (!fetchModuleRegistry[fileName]) {
        fetchModuleRegistry[fileName] = await $A.app.loadFetchModule(appName, fileName);
    }
    try {
        return fetchModuleRegistry[fileName][functionName];
    } catch (error) {
        throw Error('State Error: Could not import fetch component: ' + fileName + '.' + functionName + '. ' + error.message);
    }
}

/**
 * Parses the state key into its four components.
 * @param {string} key - Unique key in string form that identifies one fetch 'state' for recurring triggering
 * @param {string} configString - configurations: 'appName.uniqueContainerIdentifier'
 * @returns {object} - { appName, containerId, componentFunctionName }
 */
function parseConfigString(key, configString) {
    const parts = configString.split('.');
    if (parts.length !== 2) {
        throw new Error(`State Error: Invalid state key format: "${configString}". Expected format: "appName.uniqueContainerIdentifier"`);
    }
    
    const [appName, uniqueContainerIdentifier] = parts;
    const containerId = `${uniqueContainerIdentifier}Response`;
    const componentFunctionName = uniqueContainerIdentifier;
    
    if (!appName || !containerId || !componentFunctionName) {
        throw new Error(`State Error: Cannot determine all four required configuraton parts for key: "${key}". String provided: "${configString}"`);
    }
    
    return { appName, containerId, componentFunctionName };
}

/**
 * Updates the state with fetch function and its arguments, within 
 * in-memory storage for later retrieval via triggerState().
 * 
 * @param {string} key - The state key
 * @param {string} configString - configurations: 'appName.uniqueContainerIdentifier'
 * @param {Array} args - Array of additional arguments to pass to the fetch function
 * @returns {Promise<void>}
 */
async function updateState(key, configString, args = [], fetchFile = 'Default') {
    if (!Array.isArray(args)) { // Validate arguments
        console.warn(`State Error: State argument should be an array. Received: ${typeof args}. Wrapping in array.`);
        args = [args];
    }
    
    try {
        const { appName, containerId, componentFunctionName } = parseConfigString(key, configString);
        const fetchFunction = await fetchComponent(componentFunctionName, appName, fetchFile);

        if (typeof fetchFunction !== 'function') {
            throw new Error(`State Error: Function "${componentFunctionName}" not found in fetch module for app: "${appName}"`);
        }
        
        // store in memory with short-hand for key:value pairs...
        stateMemory.set(key, {
            appName,
            args,
            containerId,
            componentFunctionName,
            fetchFunction,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error(`State Error: State update failed for key: "${key}"`, error);
        throw error;
    }
}

/**
 * Triggers a previously stored state by its key.
 * This executes the fetch function with the args that were stored when updateState() was called.
 * 
 * @param {string} key - The unique key for the state (first part of the state key)
 * @returns {Promise<void>}
 */
function triggerState(key) {
    if (!stateMemory.has(key)) {
        throw new Error(`State Error: No state found for key: "${key}". Call updateState() first to initialize this state.`);
    }
    try {
        const stateData = stateMemory.get(key);
        const { appName, args, containerId, componentFunctionName, fetchFunction } = stateData;
        
        if (typeof fetchFunction !== 'function') {
            throw new Error(`State Error: Function "${componentFunctionName}" not found in fetch module for app: "${appName}"`);
        }

        // Call the fetch function with the stored args
        return fetchFunction(...args, containerId, componentFunctionName);
        
    } catch (error) {
        console.error(`State Error: State trigger failed for key: "${key}"`, error);
        throw error;
    }
}

/**
 * State Manager
 * 
 * Usage:
 * - update(key, 'appName.uniqueContainerIdentifier', [arg1, arg2, ...])
 *   Stores in state fetch function call.
 * 
 * - trigger('key')
 *   Executes the fetch function with previously stored args for that key.
 */
export default {
    save: updateState,
    trigger: triggerState,
    clearModuleCache: () => { Object.keys(fetchModuleRegistry).forEach(key => delete fetchModuleRegistry[key]); }
};

