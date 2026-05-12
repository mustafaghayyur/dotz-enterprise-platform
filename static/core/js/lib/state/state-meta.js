import $A from "../../helper.js";
//import dom from "../../helpers/dom.js";

/**
 * Manages Component's meta objects
 */
export default {
    /**
     * Central repository of meta snapshots
     */
    snapshots: {},
    app: null,

    setup: function (componentString) {
        if (this.app === null){ 
            this.app = $A.state.dom.getAppFromDom();
        }
        if ($A.base.get(this.snapshots, this.app, null) === null) {
            this.snapshots[this.app] = {};
        }
        if ($A.base.get(this.snapshots[this.app], componentString, null) === null) {
            this.snapshots[this.app][componentString] = {};
        }
        if ($A.base.get(this.snapshots[this.app][componentString], 'mapper', null) === null) {
            this.snapshots[this.app][componentString].mapper = {};
        }
    },

    /**
     * retrieve full meta object record for component
     */
    record: function (componentString) {
        this.setup(componentString);
        return this.snapshots[this.app][componentString];
    },

    /** 
     * set meta key value. mapper values set separately 
     */
    set: function (componentString, key, value, overwrite = true) {
        this.setup(componentString);
        if (key === 'mapper') { return null; }
        let parsedValue = $A.base.parse(value);

        if (overwrite === false) {
            let original = this.get(componentString, key);
            if (!$A.base.empty(original)) { return null; }
        }
        if (overwrite === 'merge') {
            let original = this.get(componentString, key);
            let merged = $A.base.merge(original, parsedValue, false);
            merged = $A.base.empty(merged) ? parsedValue : merged;
            if ($A.base.is(merged, 'list')) {
                merged = [...new Set(merged)]; // remove duplicates @todo confirm set is correct path ahead..
            }
            value = (merged === null) ? parsedValue : merged;
        }
        this.snapshots[this.app][componentString][key] = parsedValue;
        return null;
    },

    /**
     * get meta object key's value
     */
    get: function (componentString, key, defaultValue = null) {
        this.setup(componentString);
        return $A.base.get(this.snapshots[this.app][componentString], key, defaultValue);
    },

    /** 
     * sets mapper attributes 
     */
    setMapper: function (componentString, key, value, overwrite = true) {
        this.setup(componentString);
        if (overwrite === false) {
            let original = this.getMapper(componentString, key);
            if (!$A.base.empty(original)) { return null; }
        }
        let parsedValue = $A.base.parse(value);
        this.snapshots[this.app][componentString].mapper[key] = parsedValue;
        return null;
    },

    /**
     * get a mapper value
     */
    getMapper: function (componentString, key, defaultValue = null) {
        this.setup(componentString);
        let mapper = this.snapshots[this.app][componentString].mapper;
        return $A.base.get(mapper, key, defaultValue);
    },

    /**
     * delete mapper key
     */
    deleteMapperKey: function (componentString, key) {
        this.setup(componentString);
        let value = this.getMapper(componentString, key, null);
        if (value !== null) {
            delete this.snapshots[this.app][componentString].mapper[key];
        }
    },

    /**
     * returns appropriate containerId based on params.
     * @param {str} componentString 
     * @param {bool} identifierRequired: true = (response)containerId with instance identifier | false = just (response)containerId
     * @param {str} type: enum ['container', 'response'] : default is container
     */
    getContainerId: function (componentString, identifierRequired = false, type = 'container') {
        this.setup(componentString);
        let conId = this.get(componentString, 'containerId', '');
        let resconId = this.get(componentString, 'responseContainerId', '');
        let name = conId;
        let identifier = '';
        
        if (type === 'response') {
            name = resconId.replace(/Response$/,'');
        }
        if ($A.base.empty(name)) {
            console.warn('Meta Error: no DOM id found for component: ' + componentString, typeof resconId, typeof conId, typeof name, this.snapshots[this.app][componentString]);
            return null;
        }
        if (identifierRequired) {
            identifier = this.getMapper(componentString, 'containerParts', null);
        }
        identifier = $A.base.empty(identifier) ? '' : '-' + identifier;
        name = name + identifier;
        return (type === 'response') ? name + 'Response' : name;
    },
}