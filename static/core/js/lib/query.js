import $A from "../helper.js";

/**
 * Query Module allows direct server-data queries via chain-calling functions.
 * Response is handled with $A.query().execute(responseContainer, callbackFunction) paramerters.
 * 
 * Example usage:
 * $A.query().search('tata').fields('tata_id', 'description').where({status: 'created'}).order([{tbl: 'tata', col: 'create_time', sort: 'desc'}]).page(1, 20).execute('TasksListResponseContainer', customCallbackFunction); 
 * @returns chain-calling object
 */
export default function () {
    let tbl = null;
    let selectors = [];
    let conditions = {};
    let joins = {};
    let ordering = [];
    let count = null;
    let page = null;
    let translations = {};

    let reqType = null;
    let body = null;
    let params = null;
    let chosenRoute = null;

    const routes = {
        'list': 'api.terminal.list',
        'crud': 'api.terminal.crud',
    };

    const kernel = {
        /**
         * Create a new record in specified table with supplied data.
         * @param {str} tblKey: system key for table to perform crud operation on
         * @param {obj} data: data to create record with. Can be supplied as a form element or as a dictionary object. 
         * @param {bool} purified: specify whether data is supplied as a form element or as a dictionary object. Defaults to false (data is supplied as form element).
         * @returns 
         */
        create: (tblKey, data, purified = false) => {
            if ($A.base.not(tblKey, 'string') || $A.base.isVariableEmpty(tblKey)) {
                throw Error('create() requires table-key argument.');
            }

            if (purified) {
                body = data;
            } else {
                body = $A.forms.formToDictionary(data);
            }

            if ($A.base.not(body, 'dictionary')) {
                throw Error('create() requires a dictionary of data to create.');
            }

            tbl = tblKey;
            reqType = 'create';
            chosenRoute = 'crud';
            return kernel;
        },

        /**
         * Update an existing record in specified table with supplied data.
         * @param {str} tblKey: system key for table to perform crud operation on
         * @param {obj} data: data to update record with. Can be supplied as a form element or as a dictionary object. 
         * @param {bool} purified: specify whether data is supplied as a form element or as a dictionary object. Defaults to false (data is supplied as form element).
         * @returns 
         */
        edit: (tblKey, data, purified = false) => {
            if ($A.base.not(tblKey, 'string') || $A.base.isVariableEmpty(tblKey)) {
                throw Error('edit() requires table-key argument.');
            }

            if (purified) {
                body = data;
            } else {
                body = $A.forms.formToDictionary(data);
            }

            if ($A.base.not(body, 'dictionary')) {
                throw Error('edit() requires a dictionary of data to edit.');
            }

            tbl = tblKey;
            reqType = 'update';
            chosenRoute = 'crud';
            return kernel;
        },

        /**
         * Remove an existing record in specified table with supplied data.
         * @param {str} tblKey: system key for table to perform crud operation on
         * @param {obj} data: conditions to remove record(s) with. 
         * @param {bool} purified: specify whether data is supplied as a form element or as a dictionary object. Defaults to true (data is supplied as dictionary).
         * @returns 
         */
        delete: (tblKey, data, purified = true) => {
            if ($A.base.not(tblKey, 'string') || $A.base.isVariableEmpty(tblKey)) {
                throw Error('delete() requires table-key argument.');
            }

            if (purified) {
                body = data;
            } else {
                body = $A.forms.formToDictionary(data);
            }

            if ($A.base.not(body, 'dictionary')) {
                throw Error('delete() requires a dictionary of data to delete.');
            }
            tbl = tblKey;
            reqType = 'delete';
            chosenRoute = 'crud';
            return kernel;
        },

        /**
         * Retrieve an existing record(s) in specified table with supplied data.
         * @param {str} tblKey: system key for table to perform crud operation on
         * @param {obj} data: conditions to retrieve record(s) with. 
         * @param {bool} purified: specify whether data is supplied as a form element or as a dictionary object. Defaults to true (data is supplied as dictionary).
         * @returns 
         */
        read: (tblKey, data, purified = true) => {
            if ($A.base.not(tblKey, 'string') || $A.base.isVariableEmpty(tblKey)) {
                throw Error('read() requires table-key argument.');
            }

            if (purified) {
                body = data;
            } else {
                body = $A.forms.formToDictionary(data);
            }

            if ($A.base.not(body, 'dictionary')) {
                throw Error('read() requires a dictionary of data to retrieve record.');
            }

            tbl = tblKey;
            reqType = 'read';
            chosenRoute = 'crud';
            return kernel;
        },


        /**
         * Search collective data from table(s) based on conditions, joins, and ordering specified in chain-calling functions. 
         * Response is a list of records matching search criteria.
         * @param {str} tblKey 
         * @returns chain-calling object
         */
        search: (tblKey) => {
            if ($A.base.not(tblKey, 'string') || $A.base.isVariableEmpty(tblKey)) {
                throw Error('search() requires table-key argument.');
            }
            tbl = tblKey;
            reqType = 'search';
            chosenRoute = 'list';
            return kernel;
        },

        /**
         * From search(): Specify fields/columns to be retrieved in search results.
         * @param  {...any} args Comma serpated list of values, will be auto-converted to array.
         * @returns chain-calling object
         */
        fields: (...args) => {
            if ($A.base.not(args, 'list') || $A.base.isVariableEmpty(args)) {
                throw Error('search().fields() requires atleast one argument.');
            }
            selectors = args;
            return kernel;
        },

        /**
         * From search(): Specify conditions for Where elements of SQL query. 
         * @param {obj} dictionary: conditions setting out where elements of SQL.
         * @returns chain-calling object
         */
        where: (dictionary) => {
            if ($A.base.not(dictionary, 'dictionary')) {
                throw Error('search().where() requires a dictionary of values.');
            }
            conditions = dictionary;
            return kernel;
        },

        /**
         * From search(): Specify join conditions for SQL query.
         * @param {obj} dictionary: key should carry join-type seperated by pipe, along with field_name => value should carry existing table_field to join on. Example: {'inner|usus_id': 'tata_id'} where usus is the table being added, and tata is the existing table in search.
         * @returns chain-calling object
         */
        join: (dictionary) => {
            if ($A.base.not(dictionary, 'dictionary')) {
                throw Error('search().join() requires a dictionary of values.');
            }
            joins = dictionary;
            return kernel;
        },

        /**
         * From search(): Specify ordering conditions for SQL query.
         * @param {arrayOfObjs} orderByList: array of objects containing ordering conditions. Each object should have tbl, col, and sort keys. 
         * @returns chain-calling object
         */
        order: (orderByList) => {
            if ($A.base.not(orderByList, 'list')) {
                throw Error('search().order() requires a list of dictionaries containing "tbl", "col", "sort" keys.');
            }
            ordering = orderByList;
            return kernel;
        },

        /**
         * From search(): Specify pagination conditions for SQL query.
         * @param {number} pageNumber: page number to retrieve in search results. 
         * @param {number} perPage: number of records per page in search results. Defaults to 20.
         * @returns chain-calling object
         */
        page: (pageNumber, perPage = 20) => {
            if ($A.base.not(pageNumber, 'number') || $A.base.not(perPage, 'number')) {
                throw Error('search().page() requires pageNumber and perPage to both be numerical (integer) values.');
            }
            if (pageNumber < 1 || perPage < 1) {
                throw Error('search().page() requires pageNumber and perPage to both be a value greater than 0.');
            }
            count = perPage;
            page = pageNumber;
            return kernel;
        },

        /**
         * From search(): Specify translations conditions for SQL query.
         * @param {arrayOfObjs} translation: object with keys and values according to Django ORM translation specs. 
         * @returns chain-calling object
         */
        translate: (translation) => {
            if ($A.base.not(translation, 'dictionary')) {
                throw Error('search().translate() requires a list of dictionaries containing "tbl", "col", "sort" keys.');
            }
            translations = translation;
            return kernel;
        },

        /**
         * Internal function. Cleans memory after request is made.
         */
        cleanMemory: () => {
            tbl = null;
            selectors = [];
            conditions = {};
            joins = {};
            ordering = [];
            count = null;
            page = null;
            translations = {};
            reqType = null;
            body = null;
            params = null;
            chosenRoute = null;
        },

        execute: (responseContainer, callbackFunction, mapper = {}) => {
            if (tbl === null || reqType === null || chosenRoute === null) {
                throw Error('execute() requires a properly formed request. Please ensure you have specified the table and type of request.');
            }

            if (reqType === 'search') {
                body = assembleSearchParams();
            }

            if ($A.base.not(responseContainer, 'string') || $A.base.isVariableEmpty(responseContainer)) {
                throw Error('execute() requires responseContainer argument to be a non-empty string corresponding to the id attribute of a DOM element.');
            }

            if ($A.base.not(callbackFunction, 'function')) {
                if ($A.base.not(callbackFunction, 'dictionary') || $A.base.getter(callbackFunction, 'component', null) === null) {
                    throw Error('execute() requires callbackFunction argument to be a function that will handle the response from the server.');
                }
            }

            if ($A.base.not(body, 'dictionary')) {
                throw Error('execute() requires a dictionary of data to send with the request.');
            }

            body['tbl'] = tbl;
            body['reqType'] = reqType;
            
            const request = $A.fetch.route(routes[chosenRoute], params, { method: 'POST', body: JSON.stringify(body) });
            $A.fetch.body(request, responseContainer, mapper, callbackFunction);
            kernel.cleanMemory();
        }
    } 

    function assembleSearchParams() {
        return {
            tbl: tbl,
            selectors: selectors,
            conditions: conditions,
            ordering: ordering,
            joins: joins,
            limit: [page, count],
            translations: translations
        }
    }

    //return the kernal...
    return kernel;
}

