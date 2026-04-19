import $A from "../../helper.js";

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
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    create: async function (tbl, data, params, callback = null) {
        if ($A.base.is(callback, 'function')) {
            $A.query().create(tbl, data, true).execute(params.responseContainerId, callback);
        } else {
            $A.query().create(tbl, data, true).execute(params.responseContainerId, (response, respConId) => {
                $A.app.generateResponseToAction(respConId, params.confirmationMessage);
                $A.state.events.triggerAllForTable(tbl);
            });
        }
    },

    /**
     * Updates defined record using API.
     * Updates all components/caches relating to update operation tbl.
     * 
     * @param {*} tbl: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    update: async function (tbl, data, params, callback = null) {
        if ($A.base.is(callback, 'function')) {
            $A.query().edit(tbl, data, true).execute(params.responseContainerId, callback);
        } else {
            $A.query().edit(tbl, data, true).execute(params.responseContainerId, (response, respConId) => {
                $A.app.generateResponseToAction(respConId, params.confirmationMessage);
                $A.state.events.triggerAllForTable(tbl);
            });
        }
    },

    /**
     * Deletes defined record using API.
     * Updates all components/caches relating to delete operation tbl.
     * 
     * @param {*} tbl: 4-char table-key to operate on
     * @param {*} data: record dictionary holding correct field-names as recognized by system
     * @param {*} params: info needed for crud operation
     * @param {*} callback: used optionally to carry out custom operations upon successful C.U.D. action.
     */
    delete: async function (tbl, data, params, callback = null) {
        if (!$A.forms.confirmDeletion(params.identifierString)) {
            return null;
        }

        if ($A.base.is(callback, 'function')) {
            $A.query().delete(tbl, data, true).execute(params.responseContainerId, callback);
        } else {
            $A.query().delete(tbl, data, true).execute(params.responseContainerId, (response, respConId) => {
                $A.app.generateResponseToAction(respConId, params.confirmationMessage);
                $A.state.events.triggerAllForTable(tbl);
            });
        }
    },

    readFromCache: function (component, record, cacheTime) {
        if (!$A.base.isVariableEmpty(record.data) && ((Date.now() - record.timestamp) < cacheTime)) {
            return component.component(record.data, record.responseContainerId, record.mapper);
        }
        return 'failed.CacheLoad';
    },
};
