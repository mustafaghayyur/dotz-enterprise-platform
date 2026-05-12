import $A from "../../helper.js";

/**
 * Manages Redux available solely to components.
 */
export default {
    /**
     * Central repository of redux
     */
    memory: {},

    setup: function(app, componentRoot) {
        if ($A.base.get(this.memory, app, null) === null) {
            this.memory[app] = {};
        }
        if ($A.base.get(this.memory[app], componentRoot, null) === null) {
            this.memory[app][componentRoot] = {};
        }
    },

    record: function (componentRoot) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        return this.memory[app][componentRoot];
    },

    /** set meta key value. mapper values set separately */
    set: function (componentRoot, key, value, overwrite = true) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        if (overwrite === false) {
            let original = this.get(componentRoot, key, null);
            if (!$A.base.empty(original)) { return null; }
        }
        if (overwrite === 'merge') {
            let original = this.get(componentRoot, key, null);
            let merged = $A.base.merge(original, value, false);
            if ($A.base.is(merged, 'list')) {
                merged = [...new Set(merged)]; // remove duplicates
            }
            value = $A.base.empty(merged) ? value : merged;
        }
        this.memory[app][componentRoot][key] = $A.base.stringify(value, false);
        return null;
    },

    get: function (componentRoot, key, defaultValue = null) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        return $A.base.parse($A.base.get(this.memory[app][componentRoot], key, defaultValue));
    },

    delete: function (componentRoot, key) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        if (this.get(componentRoot, key) !== null) {
            delete this.memory[app][componentRoot][key];
        }
    },
}