import $A from "../helper.js";

export default {
    /**
     * Supports dictionaries, lists, strings, nulls, bools.
     * Note: bool false is NOT empty.
     * @param {*} item
     * @returns bool
     */
    empty: function (item) {
        const type = this.type(item);
        if (type === 'dictionary' && Object.keys(item).length === 0) {
            return true;
        }
        if (type === 'list' && item.length === 0) {
            return true;
        }
        if (type === 'string' && item.length === 0) {
            return true;
        }
        if (type === 'null' || type === 'undefined') {
            return true;
        }
        if (type === 'boolean') {
            return false;
        }
        if (type === 'number') {
            return false; // numbers can't be empty in js #todo: confirm this statement
        }
        return false;
    },

    /**
     * Returns a string based definition of data-type.
     * @param {*} variable: any value type
     * @returns ['string' | 'list' | 'date' | 'null' | 'dictionary' | 'undefined' | 'number' | etc..]
     */
    type: function (variable) {
        if (typeof variable === 'string') {
            return 'string';
        }
        if (Array.isArray(variable)) {
            return 'list';
        }
        if (variable === null) {
            return 'null';
        }
        if (variable instanceof Date) {
            return 'date';
        }
        if (variable !== null && typeof variable !== 'boolean' && Number.isInteger(+variable) && typeof variable === 'number') {
            return 'number';
        }
        if (variable instanceof HTMLElement) {
            return 'domelement';
        }
        if (variable instanceof Document) {
            return 'document';
        }
        if (variable instanceof NodeList) {
            return 'nodelist'
        }
        if (typeof variable === 'object' && variable !== null) {
            if (Object.prototype.toString.call(variable) === '[object Object]') {
                return 'dictionary';
            }
        }
        return typeof variable; // Handles null, undefined, number, boolean, etc.
    },

    /**
     * Is the variable of specified type?
     * @param {*} value
     * @param {*} type 
     */
    is: function (value, type) {
        if (this.type(value) === type) {
            return true;
        }
        return false;
    },

    /**
     * Is the variable not of specified type?
     * @param {*} value
     * @param {*} type 
     */
    not: function (value, type) {
        if (this.type(value) !== type) {
            return true;
        }
        return false;
    },

    isPrimitive: function (variable) {
        let type = this.type(variable);
        const allowed = ['string', 'number', 'bigint', "boolean", 'undefined', 'null', 'symbol'];
        if (allowed.includes(type)) {
            return true;
        }
        return false;
    },

    /**
     * Takes an object and key, and returns the value or a default you provide.
     * @todo: what to do with object-like objects, eg DOMStringMap instances? Decision required..
     * 
     * @param {obj} object 
     * @param {str} key 
     * @param {*} defaultsTo: null on default
     * @param {*} strict: on true we attenot a more strict check of object type, for true dictionaries
     */
    get: function (object, key, defaultsTo = null, strict = false) {
        if (!object || this.type(object) !== 'dictionary' || this.empty(object)) {
            return defaultsTo;
        }
        if (!strict) {
            if (key in object) {
                return object[key];
            }
        }
        if (strict) {
            if (!Object.hasOwn(object, key)) {
                if (!Object.prototype.hasOwnProperty.call(object, key)) {
                    if (!(key in object)) {
                        return defaultsTo;
                    }
                }
            }
            return object[key];
        }
        return defaultsTo;
    },
    

    /**
     * Loops through any basic dictionary (single level loop).
     * Callback can manipulate/retrieve keys/values as needed. 
     * Returns new object with callback() processing.
     * @param {obj} object: any valid object that is loop-able
     * @param {function} callbackFunction: should allow for key, value arguments.
     * @param {bool} convertToObject: special types of objects can be converted to dict format for looping. default true.
     * @returns new object
     */
    loop: function (object, callbackFunction, convertToObject = true) {
        if (this.type(object) !== 'dictionary') {
            if (convertToObject) {
                object = { ...object };
            }
            if (this.type(object) !== 'dictionary') {
                console.warn('UI Error: loopObject() only accepts objects for loop.', object);
                throw Error('UI Error: loopObject() only accepts objects for loop.', object);
            }
        }

        let dictionary = {}  // define new dictionary to return.
        for (const key in object) {
            // .hasOwnProperty ensures only defined properties are looped.
            if (Object.hasOwnProperty.call(object, key)) {
                dictionary[key] = callbackFunction(key, object[key]);
            }
        }

        return dictionary;
    },

    /**
     * Stringifies variable.
     * @param {*} value 
     * @returns string
     */
    stringify: function (value, format = true) {
        // JSON.parse(retrievedString);
        if (this.isPrimitive(value)) {
            return String(value);
        } else {
            try {
                if (format) {
                    return JSON.stringify(value, null, 2);
                } else {
                    return JSON.stringify(value);
                }
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value); // just send the value
            }
        }
    },

    /**
     * Parse JSON variable.
     * @param {*} value 
     * @returns JSON|original value on error
     */
    parse: function (value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value; // just send the value
        }
    },

    /**
     * Merges two data inputs. dataTwo will overwrite dataOne in case of collision.
     * @param {*} dataOne 
     * @param {*} dataTwo 
     * @returns merged | null on failure
     */
    merge: function(dataOne, dataTwo) {
        const typeOne = this.type(dataOne);
        const typeTwo = this.type(dataTwo);
        
        if (typeOne !== typeTwo) {
            console.error('Data Error: merge() was given two different Data Types: ', typeOne, typeTwo);
            throw Error('Data Error: merge() was given two different Data Types.');
        }

        if (typeOne === 'dictionary') {
            return {
                ...dataOne,
                ...dataTwo
            };
        }
        if (typeOne === 'list') {
            return [...dataOne, ...dataTwo];
        }
        if (typeOne === 'string') {
            return `${dataOne}${dataTwo}`;
        }
        if (typeOne === 'number') {
            return dataOne + dataTwo;
        }
        return null; // boolean, null, undefined, dom elements etc are not supported for merge in this implementation.
    },

    capitalizeFirstLetter: function (str) {
        if (this.type(str) === 'string'){
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str;
    },

    lowercaseFirstLetter: function (str) {
        if (this.type(str) === 'string'){
            return str.charAt(0).toLowerCase() + str.slice(1);
        }
        return str;
    },
};

