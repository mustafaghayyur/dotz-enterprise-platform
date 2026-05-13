import $A from "../../helper.js";

/**
 * Allows for standardized crud operations using state operations.
 */
export default {
    /**
     * Creates defined record using API.
     * Updates all components/caches relating to create operation tbl.
     * 
     * @param {*} tblIdentifier: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    create: async function (tblIdentifier, data, params, callback = null) {
        let tbl = tblIdentifier.split('-')[0];
        $A.query().create(tbl, data, true).execute(params.responseContainerId, async (response, respConId) => {
            $A.app.generateResponseToAction(respConId, params.confirmationMessage);
            await $A.state.events.triggerAllForTable(tblIdentifier);
            if ($A.base.is(callback, 'function')) {
                callback(response, respConId);
            }
        });
    },

    /**
     * Updates defined record using API.
     * Updates all components/caches relating to update operation tbl.
     * 
     * @param {*} tblIdentifier: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    update: async function (tblIdentifier, data, params, callback = null) { 
        let tbl = tblIdentifier.split('-')[0];
        $A.query().edit(tbl, data, true).execute(params.responseContainerId, async (response, respConId) => {
            $A.app.generateResponseToAction(respConId, params.confirmationMessage);
            await $A.state.events.triggerAllForTable(tblIdentifier);
            if ($A.base.is(callback, 'function')) {
                callback(response, respConId);
            }
        });
    },

    /**
     * Deletes defined record using API.
     * Updates all components/caches relating to delete operation tbl.
     * 
     * @param {*} tblIdentifier: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    delete: async function (tblIdentifier, data, params, callback = null) {
        if (!$A.forms.confirmDeletion(params.identifierString)) {
            return null;
        }
        let tbl = tblIdentifier.split('-')[0];
        $A.query().delete(tbl, data, true).execute(params.responseContainerId, async (response, respConId) => {
            $A.app.generateResponseToAction(respConId, params.confirmationMessage);
            await $A.state.events.triggerAllForTable(tblIdentifier);
            if ($A.base.is(callback, 'function')) {
                callback(response, respConId);
            }
        });
    },

    readFromCache: async function (component, record, cacheTime) {
        if (!$A.base.empty(record.data) && ((Date.now() - record.timestamp) < cacheTime)) {
            return await component.component(record.data, record.responseContainerId, record.mapper);
        }
        return 'failed.CacheLoad';
    },
};
