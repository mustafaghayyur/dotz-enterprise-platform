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

    record: function (componentString) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        return this.snapshots[componentString];
    },

    /** set meta key value. mapper values set separately */
    set: function (componentString, key, value, overwrite = true) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if (key === 'mapper') { return null; }
        let original = $A.base.get(this.snapshots, key, null);
        let parsedValue = $A.base.parse(value);

        if (overwrite === false) {
            if (!$A.base.empty(original)) { return null; }
        }
        if (overwrite === 'merge') {
            let merged = $A.base.merge(original, parsedValue, false);
            merged = $A.base.empty(merged) ? parsedValue : merged;
            if ($A.base.is(merged, 'list')) {
                merged = [...new Set(merged)]; // remove duplicates @todo confirm set is correct path ahead..
            }
            this.snapshots[componentString][key] = (merged === null) ? $A.base.parse(value) : merged;
            return null;
        }
        this.snapshots[componentString][key] = parsedValue;
        return null;
    },

    get: function (componentString, key, defaultValue = null) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        return $A.base.get(this.snapshots[componentString], key, defaultValue);
    },

    /** sets mapper attributes */
    setMapper: function (componentString, key, value, overwrite = true) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if ($A.base.get(this.snapshots[componentString], 'mapper', null) === null) {
            this.snapshots[componentString].mapper = {};
        }
        if (overwrite === false) {
            let original = $A.base.get(this.snapshots[componentString].mapper, key, null);
            if (!$A.base.empty(original)) { return null; }
        }
        this.snapshots[componentString].mapper[key] = $A.base.parse(value);
        return null;
    },

    getMapper: function (componentString, key, defaultValue = null) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if ($A.base.get(this.snapshots[componentString], 'mapper', null) === null) {
            this.snapshots[componentString].mapper = {};
        }
        return $A.base.get(this.snapshots[componentString].mapper, key, defaultValue);
    },

    deleteMapperKey: function (componentString, key) {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if ($A.base.get(this.snapshots[componentString], 'mapper', null) === null) {
            this.snapshots[componentString].mapper = {};
        }
        if ($A.base.get(this.snapshots[componentString].mapper, key, false)) {
            delete this.snapshots[componentString].mapper[key];
        }
    },

    /**
     * returns appropriate containerId based on type param.
     * @param {str} componentString 
     * @param {bool} identifierRequired: true = (response)containerId with instance identifier | false = just (response)containerId
     * @param {str} type: enum ['container', 'response'] : default is container
     * @returns 
     */
    getContainerId: function (componentString, identifierRequired = false, type = 'container') {
        if ($A.base.get(this.snapshots, componentString, null) === null) {
            this.snapshots[componentString] = {};
        }
        if (!$A.base.get(this.snapshots[componentString], 'containerId', false)) {
            console.warn('Meta Error: component has no containerId set: ' + componentString);
            return null;
        }
        if (!$A.base.get(this.snapshots[componentString], 'responseContainerId', false)) {
            console.warn('Meta Error: component has no responseContainerId set: ' + componentString);
            return null;
        }

        let name = this.snapshots[componentString]['containerId'];
        let identifier = '';
        if (identifierRequired) {
            identifier = this.getMapper(componentString, 'containerParts', '');
        }
        identifier = $A.base.empty(identifier) ? '' : '-' + identifier;
        let base = name + identifier;
        return (type === 'response') ? base + 'Response' : base;
    },
}