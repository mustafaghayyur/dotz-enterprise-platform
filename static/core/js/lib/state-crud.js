import $A from "../helper.js";

/**
 * Allows for standardized crud operations using state operations.
 */
export default {
    /**
     * Creates defined record using API.
     * Updates all components/caches relating to create operation tbl.
     * 
     * @param {*} tbl: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} element: dom element, usually the 'containerId' element (not-{Response}-suffixed)
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    create: async function (tbl, data, element, callback = null) {
        const i = await this.extract(element, data);

        if ($A.generic.checkVariableType(callback) === 'function') {
            $A.query().create(tbl, data, true).execute(i.containerId, callback);
        } else {
            $A.query().create(tbl, data, true).execute(i.containerId, standardCallback);
        }
        const standardCallback = (response, respConId) => {
            $A.app.generateResponseToAction(respConId, i.confirmationMessage);
            $A.state.dom.triggerAllForTable(tbl);
        }
    },

    /**
     * Updates defined record using API.
     * Updates all components/caches relating to update operation tbl.
     * 
     * @param {*} tbl: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} element: dom element, usually the 'containerId' element (not-{Response}-suffixed)
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    update: async function (tbl, data, element, callback = null) {
        const i = await this.extract(element, data);

        if ($A.generic.checkVariableType(callback) === 'function') {
            $A.query().edit(tbl, data, true).execute(i.containerId, callback);
        } else {
            $A.query().edit(tbl, data, true).execute(i.containerId, standardCallback);
        }
        const standardCallback = (response, respConId) => {
            $A.app.generateResponseToAction(respConId, i.confirmationMessage);
            $A.state.dom.triggerAllForTable(tbl);
        }
    },

    /**
     * Deletes defined record using API.
     * Updates all components/caches relating to delete operation tbl.
     * 
     * @param {*} tbl: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} element: dom element, usually the 'containerId' element (not-{Response}-suffixed)
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    delete: async function (tbl, data, element, callback = null) {
        const i = await this.extract(element, data);

        if (!$A.forms.confirmDeletion(i.identifierString)) {
            return null;
        }

        if ($A.generic.checkVariableType(callback) === 'function') {
            $A.query().delete(tbl, data, true).execute(i.containerId, callback);
        } else {
            $A.query().delete(tbl, data, true).execute(i.containerId, standardCallback);
        }
        const standardCallback = (response, respConId) => {
            $A.app.generateResponseToAction(respConId, i.confirmationMessage);
            $A.state.dom.triggerAllForTable(tbl);
        }
    },

    readFromCache: function (component, record, cacheTime) {
        console.log('Cache check: ',  record, (Date.now() - record.timestamp), cacheTime, record.timestamp);
        if (!$A.generic.isVariableEmpty(record.data) && ((Date.now() - record.timestamp) < cacheTime)) {
            console.log('MG - call component FROM CACHE: ', component.name, component, record);
            component.component(record.data, record.responseContainerId, record.mapper);
            return true;
        }
        return false;
    },

    extract: async function (element) {
        const params = {};
        info = await $A.state.dom.captureComponentData(element, false);
        params.tblKey = $A.generic.getter(info, 'tbl', '');
        params.stateKey = $A.generic.getter(info, 'key', '');
        params.componentName = $A.state.get.componentName(info);
        params.containerId = `${componentName}Response`;
        params.confirmationMessage = element.dataset.stateMapperConfirmMessage; //$A.generic.getter(data, 'confirm', 'Delete operation perfomed.');
        params.identifierString = element.dataset.stateMapperIdentifierString; //$A.generic.getter(data, 'idString', 'Are you sure you want to delete this item?');
        params.app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName;
        return params;
    },
};
