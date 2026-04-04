import $A from "../helper.js";

/**
 * Allows for standardized crud operations using state operations.
 */
export default {
    create: function (tbl, data, element, callback = null) {
        const i = this.extract(element, data);

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

    update: function (tbl, data, element) {
        const i = this.extract(element, data);

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

    delete: function (tbl, data, element) {
        const i = this.extract(element, data);

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

    readFromCache: async function (data, timestamp, cacheTime, record) {
        console.log('Cache check: ', data,  record, (Date.now() - timestamp), cacheTime, timestamp);
        if (!$A.generic.isVariableEmpty(data) && ((Date.now() - timestamp) < cacheTime)) {
            const component = await $A.app.load(record.componentName, record.appName);
            console.log('We are calling component from Cache:', record.containerId);
            component(data, record.containerId);
            return true;   
        }
        return false;
    },

    extract: function (element) {
        const params = {};
        info = $A.state.dom.captureComponentData(element, false);
        params.tblKey = $A.generic.getter(info, 'tbl', '');
        params.stateKey = $A.generic.getter(info, 'key', '');
        params.componentName = $A.state.get.componentName(stateKey);
        params.containerId = `${componentName}Response`;
        params.confirmationMessage = element.dataset.stateMapperConfirmMessage; //$A.generic.getter(data, 'confirm', 'Delete operation perfomed.');
        params.identifierString = element.dataset.stateMapperIdentifierString; //$A.generic.getter(data, 'idString', 'Are you sure you want to delete this item?');
        params.app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName;
        return params;
    },
};
