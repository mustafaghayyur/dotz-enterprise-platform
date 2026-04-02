import $A from "../helper.js";

export default {
    create: function (element, data) {
        const i = this.extract(element, data);
        $A.query().create(i.tblKey, data, true).execute(i.containerId, (response, containerId) => {
            $A.app.generateResponseToAction(containerId, i.confirmationMessage);
            $A.state.trigger(i.stateKey);
        });
    },

    update: function (element, data) {
        const i = this.extract(element, data);
        $A.query().edit(i.tblKey, data, true).execute(i.containerId, (response, containerId) => {
            $A.app.generateResponseToAction(containerId, i.confirmationMessage);
            $A.state.trigger(i.stateKey);
        });
    },

    delete: function (element, data) {
        const i = this.extract(element, data);

        if (!$A.forms.confirmDeletion(i.identifierString)) {
            return null;
        }
        
        $A.query().delete(i.tblKey, data, true).execute(i.containerId, (response, containerId) => {
            $A.app.generateResponseToAction(containerId, i.confirmationMessage);
            $A.state.trigger(i.stateKey);
        });
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

    extract: function (element, data) {
        const params = {};
        info = $A.state.dom.captureComponentData(element, false);
        params.tblKey = $A.generic.getter(info, 'tbl', '');
        params.stateKey = $A.generic.getter(info, 'key', '');
        params.componentName = $A.state.get.componentName(stateKey);
        params.containerId = `${componentName}Response`;
        params.confirmationMessage = $A.generic.getter(data, 'confirmationMessage', 'Delete operation perfomed.');
        params.identifierString = $A.generic.getter(data, 'identifierString', 'Are you sure you want to delete this item?');
        params.app = $A.dom.searchElementCorrectly('[data-state-app-name]').dataset.stateAppName;
        return params;
    },
};